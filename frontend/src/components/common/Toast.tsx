type ToastProps = {
  message: string
  onClose: () => void
}

function Toast({ message, onClose }: ToastProps) {
  return (
    <div className="toast" role="status">
      <span>{message}</span>

      <button type="button" onClick={onClose} aria-label="Close notification">
        ×
      </button>
    </div>
  )
}

export default Toast