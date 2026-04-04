import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 Error Boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#fee',
          border: '1px solid #f88',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h2>❌ Lỗi Component</h2>
          <p>{this.state.error?.message}</p>
          <details style={{ marginTop: '20px', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
            <summary>Chi tiết lỗi</summary>
            {this.state.error?.stack}
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
