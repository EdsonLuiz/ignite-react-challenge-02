import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const updateLocalStorage = async (newCartValue: Product[]) => {
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCartValue))
  }

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const cartCopy = [...cart]

      const productExistsInCart = cartCopy.find(product => product.id === productId)
      const quantityOfProductInCart = productExistsInCart?.amount || 0
      const newQuantityOFProductsInCart = quantityOfProductInCart + 1

      const quantityOfProductInStock = await api.get(`/stock/${productId}`)
        .then(response => response.data.amount)

      if(newQuantityOFProductsInCart > quantityOfProductInStock) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      } else {
        const response = await api.get(`/products/${productId}`)
        const product = response.data
        const newProduct = {...product, amount: newQuantityOFProductsInCart}
        cartCopy.push(newProduct)

        setCart(cartCopy)
        updateLocalStorage(cartCopy)
        // localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartCopy))
      }


    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
