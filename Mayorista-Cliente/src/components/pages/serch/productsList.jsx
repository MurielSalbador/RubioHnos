import "./productsList.css"

function ListOfProducts({ products }) {
  return (
    <ul className='products-container'>
      {products.map(product => (
        <li className='product-card' key={product.id}>
          <img src={product.imageUrl} alt={product.title} />
          <h3>{product.title}</h3>
          <p><strong>Marca:</strong> {product.brand}</p>
          <p> ${Number(product.price).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p><strong>Disponible:</strong> {product.available ? "Sí" : "No"}</p>
          
        </li>
      ))}
    </ul>
  )
}

function NoProductResults() {
  return <p>No se encontraron productos para esta búsqueda</p>
}

export function Products({ products }) {
  const hasProducts = products?.length > 0
  return hasProducts ? <ListOfProducts products={products} /> : <NoProductResults />
}