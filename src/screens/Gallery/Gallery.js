import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './Gallery.css';

const Gallery = () => {
  const [activeTab, setActiveTab] = useState('Images');
  const [files, setFiles] = useState([]);
  const [folderStack, setFolderStack] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [file, setFile] = useState(null);
  const [authUrl, setAuthUrl] = useState(null);
  const fileInputRef = useRef(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = currentFolderId ? { folderId: currentFolderId } : { type: activeTab };
      const res = await axios.get('/api/files', {
        params,
        withCredentials: true,
      });
      setFiles(res.data.files);
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          const res = await axios.get('/api/auth-url', { withCredentials: true });
          setAuthUrl(res.data.authUrl);
        } catch (authErr) {
          setError('Failed to get authentication URL');
        }
      } else {
        setError(err.response?.data?.error || 'Failed to fetch files');
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentFolderId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleChooseFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please choose a file first.');
      return;
    }
    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', activeTab);

    try {
      await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await fetchFiles();
    } catch (err) {
      if (err.response?.status === 401) {
        const res = await axios.get('/api/auth-url', { withCredentials: true });
        setAuthUrl(res.data.authUrl);
      } else {
        setError(err.response?.data?.error || 'Upload failed.');
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`/api/delete/${fileId}`, {
        withCredentials: true,
      });
      await fetchFiles();
    } catch (err) {
      if (err.response?.status === 401) {
        const res = await axios.get('/api/auth-url', { withCredentials: true });
        setAuthUrl(res.data.authUrl);
      } else {
        setError(err.response?.data?.error || 'Delete failed.');
      }
    }
  };

  const navigateToFolder = (folderId, folderName) => {
    setFolderStack((prev) => [...prev, { id: folderId, name: folderName }]);
    setCurrentFolderId(folderId);
  };

  const navigateBack = (index) => {
    if (index === -1) {
      setFolderStack([]);
      setCurrentFolderId(null);
      return;
    }
    const newStack = folderStack.slice(0, index);
    const newFolderId = index > 0 ? folderStack[index - 1].id : null;
    setFolderStack(newStack);
    setCurrentFolderId(newFolderId);
  };

  const openFile = (file) => {
    const url = file.webViewLink || file.webContentLink || `https://drive.google.com/file/d/${file.id}/view`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isFolder = (file) => file.mimeType === 'application/vnd.google-apps.folder';

  if (authUrl) {
    return (
      <div className="gallery-container">
        <h2>Google Drive Login Required</h2>
        <a href={authUrl} target="_blank" rel="noopener noreferrer">
          <button>Login with Google</button>
        </a>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <div className="gallery-tabs">
        {['Images', 'Videos', 'Docs'].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => {
              setActiveTab(tab);
              setCurrentFolderId(null);
              setFolderStack([]);
            }}
            disabled={loading}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <form className="gallery-upload" onSubmit={handleUpload}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          accept={
            activeTab === 'Images'
              ? 'image/*'
              : activeTab === 'Videos'
              ? 'video/*'
              : activeTab === 'Docs'
              ? '.pdf,.doc,.docx,.txt,.css,.csv,.xls,.xlsx'
              : '*'
          }
          style={{ display: 'none' }}
        />

        <button type="button" onClick={handleChooseFile} disabled={loading}>
          Choose File
        </button>

        {file && <span style={{ marginLeft: '10px' }}>{file.name}</span>}

        <button type="submit" disabled={loading || !file}>
          {loading ? `Uploading... ${uploadProgress}%` : `Upload to ${activeTab}`}
        </button>
      </form>

      {folderStack.length > 0 && (
        <div className="breadcrumb">
          <button onClick={() => navigateBack(-1)} disabled={loading}>
            Root
          </button>
          {folderStack.map((folder, index) => (
            <React.Fragment key={folder.id}>
              <span>/</span>
              <button onClick={() => navigateBack(index)} disabled={loading}>
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {loading && (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      )}

      <div className="gallery-grid">
        {files.length === 0 && !loading ? (
          <p>No files found</p>
        ) : (
          files.map((f) => (
            <div key={f.id} className="gallery-item">
              {isFolder(f) ? (
                <div
                  onClick={() => navigateToFolder(f.id, f.name)}
                  className="gallery-folder"
                >
                  <div className="gallery-folder-icon">📁</div>
                  <p title={f.name}>{f.name}</p>
                </div>
              ) : (
                <>
                  {f.mimeType.startsWith('image/') && (
                    <img
                      src={`https://drive.google.com/thumbnail?id=${f.id}&sz=w500`}
                      alt={f.name}
                      loading="lazy"
                      onClick={() => openFile(f)}
                    />
                  )}
                  {f.mimeType.startsWith('video/') && (
                    <video onClick={() => openFile(f)} preload="metadata">
                      <source
                        src={`https://drive.google.com/uc?id=${f.id}#t=0.5`}
                        type="video/mp4"
                      />
                    </video>
                  )}
                  {(f.mimeType.includes('pdf') || 
                    f.mimeType.includes('document') || 
                    f.mimeType.includes('sheet') || 
                    f.mimeType.includes('excel') || 
                    f.name.endsWith('.csv') ||
                    f.name.endsWith('.xlsx') ||
                    f.name.endsWith('.xls')
                  ) && (
                    <div onClick={() => openFile(f)} className="gallery-doc">
                      <div className="gallery-doc-icon">
                        {f.mimeType.includes('pdf') ? '📄'
                          : f.mimeType.includes('document') ? '📝'
                          : f.mimeType.includes('sheet') || f.mimeType.includes('excel') || f.name.endsWith('.xlsx') || f.name.endsWith('.xls') ? '📊'
                          : f.name.endsWith('.css') ? '🎨'
                          : '📁'}
                      </div>
                      <p title={f.name}>{f.name}</p>
                    </div>
                  )}

                  <div className="gallery-item-actions">
                    <a
                      href={`/api/download/${f.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn"
                    >
                      Download
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(f.id);
                      }}
                      className="delete-btn"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Gallery;