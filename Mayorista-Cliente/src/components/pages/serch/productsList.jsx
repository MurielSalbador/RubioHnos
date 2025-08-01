import "./productsList.css"

function ListOfProducts({ products }) {
  const BASE_URL = import.meta.env.VITE_BASE_SERVER_URL;

  return (
    <ul className='product-list'>
      {products.map(product => (
        <li className='product-card' key={product._id}>
          {product.imageUrl && (
            <img src={`${BASE_URL}${product.imageUrl}`} alt={product.title} />
          )}
          <h3>{product.title}</h3>
          <p><strong>Marca:</strong> {product.brand}</p>
          <p> ${Number(product.price).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p><strong>Disponible:</strong> {product.available ? "Sí" : "No"}</p>
        </li>
      ))}
    </ul>
  );
}


function NoProductResults() {
  return <p>No se encontraron productos para esta búsqueda</p>
}

export function Products({ products }) {
  const hasProducts = products?.length > 0
  return hasProducts ? <ListOfProducts products={products} /> : <NoProductResults />
}