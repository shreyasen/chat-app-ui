// Group messages by date
export const groupMessagesByDate = (messages) => {
  return messages.reduce((acc, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString("en-GB"); // DD/MM/YYYY format
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(msg);
    return acc;
  }, {});
};
