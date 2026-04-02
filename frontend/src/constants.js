// Constants - Giữ các hằng số chung
export const POSITIONS = [
  { value: 'WAITER', label: 'Bồi bàn' },
  { value: 'CHEF', label: 'Đầu bếp' },
  { value: 'CASHIER', label: 'Thu ngân' },
  { value: 'MANAGER', label: 'Quản lý' }
]

export const MENU_CATEGORIES = [
  { value: 'APPETIZER', label: 'Đồ ăn nhẹ' },
  { value: 'RICE', label: 'Cơm' },
  { value: 'NOODLES', label: 'Mì/Phở' },
  { value: 'DRINK', label: 'Nước uống' },
  { value: 'DESSERT', label: 'Tráng miệng' }
]

export const ORDER_STATUS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy'
}

export const STATUS_COLORS = {
  PENDING: 'status-pending',
  CONFIRMED: 'status-confirmed',
  PREPARING: 'status-preparing',
  COMPLETED: 'status-completed',
  CANCELLED: 'status-cancelled'
}
