function EmptyState({ title = 'Nothing here yet', message = 'Add your first item to get started.' }) {
  return (
    <div
      className="card-white"
      style={{
        padding: 28,
        textAlign: 'center',
        color: 'var(--gray-600)',
        borderStyle: 'dashed',
      }}
    >
      <h3 style={{ color: 'var(--forest)', marginBottom: 8 }}>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
