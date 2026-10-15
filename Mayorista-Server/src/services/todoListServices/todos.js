const API_URL = 'https://api.jsonbin.io/v3/b/63ff3a52ebd26539d087639c';

// Tipo de todo en JavaScript (solo a modo referencia de propiedades, no tipado)
export const fetchTodos = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) {
    console.error('Error fetching todos');
    return [];
  }

  const { record: todos } = await res.json();
  return todos;
};

export const updateTodos = async ({ todos }) => {
  console.log(import.meta.env.VITE_API_BIN_KEY);

  const res = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': import.meta.env.VITE_API_BIN_KEY
    },
    body: JSON.stringify(todos)
  });

  return res.ok;
};
