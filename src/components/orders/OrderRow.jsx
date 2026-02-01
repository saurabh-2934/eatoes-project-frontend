const OrderRow = ({ order }) => {
  return (
    <div>
      <strong>{order.orderNumber}</strong> - {order.status}
    </div>
  );
};

export default OrderRow;
