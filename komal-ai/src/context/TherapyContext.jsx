import React, { createContext, useContext, useReducer, useEffect } from 'react';

const TherapyContext = createContext(null);

const STORAGE_KEY = 'komal_app_state';

const loadPersistedState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    // Fallback migration from legacy key if present
    const legacy = localStorage.getItem('komal_ai_saved_chats');
    if (legacy) {
      const parsed = JSON.parse(legacy);
      return {
        currentConversation: null,
        savedConversation: parsed[0] || null,
        history: parsed || [],
      };
    }
  } catch (e) {
    console.error('Failed to parse localStorage state:', e);
  }
  return {
    currentConversation: null,
    savedConversation: null,
    history: [],
  };
};

const persisted = loadPersistedState();

const initialState = {
  currentTherapist: null,
  sessionStatus: 'idle', // 'idle', 'intro', 'listening', 'speaking', 'thinking', 'paused'
  chatMessages: [],
  savedConversation: persisted.savedConversation,
  history: persisted.history,
  notification: null, // User feedback notification e.g. "Saved to local storage"
};

const therapyReducer = (state, action) => {
  switch (action.type) {
    case 'SELECT_THERAPIST':
      return {
        ...state,
        currentTherapist: action.payload,
        sessionStatus: 'idle',
        chatMessages: [],
      };

    case 'SET_STATUS':
      return { ...state, sessionStatus: action.payload };

    case 'TOGGLE_PAUSE':
      return {
        ...state,
        sessionStatus: state.sessionStatus === 'paused' ? 'listening' : 'paused',
      };

    case 'STREAM_MESSAGE': {
      const { sender, text, delta, isFinal } = action.payload;
      const messages = [...state.chatMessages];
      const lastIndex = messages.length - 1;
      const lastMsg = lastIndex >= 0 ? messages[lastIndex] : null;

      // If last message matches sender and wasn't finalized, update it in place
      if (lastMsg && lastMsg.sender === sender && !lastMsg.isFinal) {
        const updatedText = delta ? lastMsg.text + delta : text;
        messages[lastIndex] = {
          ...lastMsg,
          text: updatedText,
          isFinal: !!isFinal,
          timestamp: new Date(),
        };
      } else {
        // Create new message turn
        messages.push({
          id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
          sender,
          text: delta || text || '',
          isFinal: !!isFinal,
          timestamp: new Date(),
        });
      }

      return {
        ...state,
        chatMessages: messages,
      };
    }

    case 'ADD_MESSAGE': {
      return {
        ...state,
        chatMessages: [
          ...state.chatMessages,
          {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
            ...action.payload,
            timestamp: action.payload.timestamp || new Date(),
            isFinal: true,
          },
        ],
      };
    }

    case 'SAVE_CHAT': {
      // Free tier rule per backend_plan.md: strictly 1 saved conversation
      if (state.savedConversation) {
        return {
          ...state,
          notification: {
            type: 'warning',
            message: 'Your free plan includes 1 saved conversation. Delete or replace the existing one to save a new one.',
          },
        };
      }

      if (state.chatMessages.length === 0) {
        return {
          ...state,
          notification: {
            type: 'info',
            message: 'No conversation to save yet.',
          },
        };
      }

      const newSaved = {
        id: Date.now().toString(),
        therapistId: state.currentTherapist?.id || 'komal',
        title: action.payload?.title || 'Therapy session',
        date: new Date().toISOString(),
        messages: state.chatMessages,
      };

      const nextHistory = [newSaved];
      const newState = {
        ...state,
        savedConversation: newSaved,
        history: nextHistory,
        notification: {
          type: 'success',
          message: 'Conversation saved locally.',
        },
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          currentConversation: null,
          savedConversation: newSaved,
          history: nextHistory,
        })
      );

      return newState;
    }

    case 'NEW_CHAT': {
      return {
        ...state,
        chatMessages: [],
        sessionStatus: 'idle',
        notification: null,
      };
    }

    case 'LOAD_CHAT': {
      const chat = action.payload;
      return {
        ...state,
        chatMessages: chat.messages.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp),
          isFinal: true,
        })),
        currentTherapist: chat.therapistId ? { id: chat.therapistId } : state.currentTherapist,
        sessionStatus: 'idle',
      };
    }

    case 'DELETE_SAVED_CHAT': {
      const newState = {
        ...state,
        savedConversation: null,
        history: [],
        notification: {
          type: 'info',
          message: 'Saved conversation removed.',
        },
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          currentConversation: null,
          savedConversation: null,
          history: [],
        })
      );

      return newState;
    }

    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notification: null,
      };

    default:
      return state;
  }
};

export const TherapyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(therapyReducer, initialState);

  const value = {
    // State
    currentTherapist: state.currentTherapist,
    sessionStatus: state.sessionStatus,
    chatMessages: state.chatMessages,
    savedConversation: state.savedConversation,
    savedChats: state.history, // Backwards compatibility for ChatHistory component
    history: state.history,
    notification: state.notification,

    // Actions
    selectTherapist: (therapist) => dispatch({ type: 'SELECT_THERAPIST', payload: therapist }),
    setSessionStatus: (status) => dispatch({ type: 'SET_STATUS', payload: status }),
    togglePause: () => dispatch({ type: 'TOGGLE_PAUSE' }),
    streamMessage: (payload) => dispatch({ type: 'STREAM_MESSAGE', payload }),
    addMessage: (message) => dispatch({ type: 'ADD_MESSAGE', payload: message }),
    saveChat: (title) => dispatch({ type: 'SAVE_CHAT', payload: { title } }),
    newChat: () => dispatch({ type: 'NEW_CHAT' }),
    clearMessages: () => dispatch({ type: 'NEW_CHAT' }),
    loadChat: (chat) => dispatch({ type: 'LOAD_CHAT', payload: chat }),
    deleteSavedChat: (id) => dispatch({ type: 'DELETE_SAVED_CHAT', payload: id }),
    dismissNotification: () => dispatch({ type: 'DISMISS_NOTIFICATION' }),
    dispatch,
  };

  return (
    <TherapyContext.Provider value={value}>
      {children}
    </TherapyContext.Provider>
  );
};

export const useTherapy = () => {
  const context = useContext(TherapyContext);
  if (!context) {
    throw new Error('useTherapy must be used within a TherapyProvider');
  }
  return context;
};
