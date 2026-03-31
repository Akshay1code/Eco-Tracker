import { useMemo, useState } from 'react';

export function useXPSystem(initialTodos) {
  const [todos, setTodos] = useState(initialTodos);
  const [xpPops, setXpPops] = useState([]);

  const totalXP = useMemo(
    () => todos.filter((todo) => todo.done).reduce((sum, todo) => sum + todo.xp, 0),
    [todos]
  );
  const level = Math.floor(totalXP / 200) + 1;
  const levelPct = ((totalXP % 200) / 200) * 100;

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id !== id) {
          return todo;
        }

        const nextDone = !todo.done;
        if (nextDone) {
          const popId = `${Date.now()}-${todo.id}`;
          setXpPops((old) => [...old, { id: popId, xp: todo.xp, text: todo.text }]);
          setTimeout(() => {
            setXpPops((old) => old.filter((pop) => pop.id !== popId));
          }, 1100);
        }

        return { ...todo, done: nextDone };
      })
    );
  };

  const addTodo = (text, xp = 25, icon = '\uD83C\uDF3F') => {
    if (!text.trim()) {
      return;
    }

    setTodos((prev) => [
      ...prev,
      {
        id: prev.length ? Math.max(...prev.map((todo) => todo.id)) + 1 : 1,
        text: text.trim(),
        xp,
        done: false,
        icon,
      },
    ]);
  };

  return { todos, xpPops, totalXP, level, levelPct, toggleTodo, addTodo };
}
