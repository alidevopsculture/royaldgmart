export const shouldShowNotification = (notification) => {
  return notification && 
         notification.isActive && 
         notification.isVisible && 
         notification.message;
};
