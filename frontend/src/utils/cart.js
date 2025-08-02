export function getCart(){
    let cart = localStorage.getItem("cart");
    if(cart == null){
        cart = []
        localStorage.setItem("cart", JSON.stringify(cart));
        return []
    }

    cart = JSON.parse(cart)
    return cart;
}

export function addToCart(product, qty = 1){
    let cart = getCart();

    const productIndex = cart.findIndex(prdct => prdct.productId === product._id);

    if(productIndex == -1){
        cart.push(
            {
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: qty,
                image: product.images[0]
            }
        )
    }else{
        cart[productIndex].quantity += qty;

        if(cart[productIndex].quantity <= 0){
            cart = cart.filter((prdct) => prdct.productId !== product._id); 
        }   
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    console.log("Cart updated:", cart);
    return cart;
}

export function removeFromCart(productId){
    let cart = getCart();
    cart = cart.filter((product) => product.productId !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    return cart;
}

export function updateQuantity (productId, newQuantity) {
    try {
      if (newQuantity <= 0) {
        return removeFromCart(productId);
      }
      
      const cart = getCart();
      const updatedCart = cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity }
          : item
      );
      
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    } catch (error) {
      console.error("Error updating quantity:", error);
      return getCart();
    }
  }