/**
 * Toast Notification Utility
 * Shows temporary notifications without blocking user interaction
 */

const showToast = (message, type = 'info', duration = 3000) => {
  const toastContainer = document.getElementById('toast-container') || createToastContainer()
  
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message
  toast.style.cssText = `
    padding: 12px 16px;
    border-radius: 4px;
    margin-bottom: 10px;
    animation: slideIn 0.3s ease-out;
    min-width: 300px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  `
  
  // Color based on type
  const colors = {
    success: { bg: '#4caf50', text: 'white' },
    error: { bg: '#f44336', text: 'white' },
    warning: { bg: '#ff9800', text: 'white' },
    info: { bg: '#2196f3', text: 'white' }
  }
  
  const style = colors[type] || colors.info
  toast.style.backgroundColor = style.bg
  toast.style.color = style.text
  
  toastContainer.appendChild(toast)
  
  // Auto remove after duration
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out forwards'
    setTimeout(() => toast.remove(), 300)
  }, duration)
}

const createToastContainer = () => {
  const container = document.createElement('div')
  container.id = 'toast-container'
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    pointer-events: none;
  `
  
  // Add CSS animations
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
    
    .toast {
      pointer-events: auto;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .toast:hover {
      transform: translateX(-5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
  `
  
  if (!document.head.querySelector('#toast-styles')) {
    style.id = 'toast-styles'
    document.head.appendChild(style)
  }
  
  document.body.appendChild(container)
  return container
}

export default showToast
