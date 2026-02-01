import { toggleMenuAvailability } from "../../api/menu.api";

const MenuCard = ({ item }) => {
  const toggleAvailability = async () => {
    try {
      await toggleMenuAvailability(item._id);
    } catch {
      alert("Failed to update availability");
    }
  };

  return (
    <div>
      <h3>{item.name}</h3>
      <p>{item.category}</p>
      <p>₹{item.price}</p>
      <button onClick={toggleAvailability}>
        {item.isAvailable ? "Available" : "Unavailable"}
      </button>
    </div>
  );
};

export default MenuCard;
