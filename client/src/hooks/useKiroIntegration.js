import { useState, useEffect, useCallback } from 'react';

export const useKiroIntegration = () => {
  const [isKiroEnvironment, setIsKiroEnvironment] = useState(false);
  const [workspaceFiles, setWorkspaceFiles] = useState([]);

  useEffect(() => {
    // Check if we're running inside Kiro
    setIsKiroEnvironment(!!window.kiroAPI);

    if (window.kiroAPI) {
      // Listen for Kiro responses
      const handleKiroResponse = (event) => {
        const { command, files, content, filePath, error } = event.detail;
        
        switch (command) {
          case 'workspaceFiles':
            setWorkspaceFiles(files || []);
            break;
          case 'fileContent':
            // Dispatch custom event for file content
            window.dispatchEvent(new CustomEvent('fileContentReceived', {
              detail: { filePath, content, error }
            }));
            break;
          case 'fileWritten':
            // Dispatch custom event for file write confirmation
            window.dispatchEvent(new CustomEvent('fileWritten', {
              detail: { filePath, success: !error, error }
            }));
            break;
        }
      };

      window.addEventListener('kiroResponse', handleKiroResponse);
      
      // Load workspace files on mount
      window.kiroAPI.getWorkspaceFiles();

      return () => {
        window.removeEventListener('kiroResponse', handleKiroResponse);
      };
    }
  }, []);

  const readWorkspaceFile = useCallback((filePath) => {
    if (window.kiroAPI) {
      return new Promise((resolve, reject) => {
        const handleFileContent = (event) => {
          const { filePath: receivedPath, content, error } = event.detail;
          if (receivedPath === filePath) {
            window.removeEventListener('fileContentReceived', handleFileContent);
            if (error) {
              reject(new Error(error));
            } else {
              resolve(content);
            }
          }
        };

        window.addEventListener('fileContentReceived', handleFileContent);
        window.kiroAPI.readFile(filePath);
      });
    }
    return Promise.reject(new Error('Not in Kiro environment'));
  }, []);

  const writeWorkspaceFile = useCallback((filePath, content) => {
    if (window.kiroAPI) {
      return new Promise((resolve, reject) => {
        const handleFileWritten = (event) => {
          const { filePath: receivedPath, success, error } = event.detail;
          if (receivedPath === filePath) {
            window.removeEventListener('fileWritten', handleFileWritten);
            if (success) {
              resolve();
            } else {
              reject(new Error(error));
            }
          }
        };

        window.addEventListener('fileWritten', handleFileWritten);
        window.kiroAPI.writeFile(filePath, content);
      });
    }
    return Promise.reject(new Error('Not in Kiro environment'));
  }, []);

  const showKiroMessage = useCallback((message) => {
    if (window.kiroAPI) {
      window.kiroAPI.showMessage(message);
    }
  }, []);

  return {
    isKiroEnvironment,
    workspaceFiles,
    readWorkspaceFile,
    writeWorkspaceFile,
    showKiroMessage
  };
};