'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

const AssistantContext = createContext(null);

export function AssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeContext, setActiveContext] = useState(null);
  const [initialPrompt, setInitialPrompt] = useState('');
  const [activeConversationId, setActiveConversationId] = useState(null);

  /**
   * Open the assistant, optionally attaching context and an initial prompt
   */
  const openAssistant = useCallback((context = null, prompt = '', conversationId = null) => {
    if (context) {
      setActiveContext(context);
    }
    if (prompt) {
      setInitialPrompt(prompt);
    }
    if (conversationId) {
      setActiveConversationId(conversationId);
    }
    setIsOpen(true);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleAssistant = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const clearContext = useCallback(() => {
    setActiveContext(null);
  }, []);

  const clearInitialPrompt = useCallback(() => {
    setInitialPrompt('');
  }, []);

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        activeContext,
        initialPrompt,
        activeConversationId,
        openAssistant,
        closeAssistant,
        toggleAssistant,
        clearContext,
        clearInitialPrompt,
        setActiveConversationId,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
}
