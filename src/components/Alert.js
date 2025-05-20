export function Alert({ message, type = "error" }) {
  const baseStyles = "px-4 py-3 rounded relative mb-2 text-center mt-2";
  const styles = {
    error: "bg-red-200 text-red-600",
    success: "bg-green-200 text-green-700",
  };

  return (
    <div className={`${styles[type]} ${baseStyles}`}>
      <span className="sm:inline block">{message}</span>
    </div>
  );
}
