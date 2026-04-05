// Reusable Auth Layout Component
export function AuthContainer({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center px-4 py-8">
      {children}
    </div>
  )
}

export function AuthCard({ children, title, subtitle }) {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
      {title && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

export function FormGroup({ label, id, required, children }) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
    </div>
  )
}

export function Alert({ type = 'error', children }) {
  const styles = {
    error: 'bg-red-50 text-red-800 border-l-4 border-red-500',
    success: 'bg-green-50 text-green-800 border-l-4 border-green-500',
    warning: 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500',
    info: 'bg-blue-50 text-blue-800 border-l-4 border-blue-500'
  }
  return (
    <div className={`px-4 py-3 rounded mb-6 animate-slide-down ${styles[type] || styles.error}`}>
      {children}
    </div>
  )
}

export function InputField({ label, id, type = 'text', placeholder, disabled, required, ...props }) {
  return (
    <FormGroup label={label} id={id} required={required}>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
        {...props}
      />
    </FormGroup>
  )
}
