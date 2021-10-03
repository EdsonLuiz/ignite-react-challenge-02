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
      const cartCopy = [...cart]

      const productExistsInCart = cartCopy.find(product => product.id === productId)
      const quantityOfProductInCart = productExistsInCart?.amount || 0
      const newQuantityOFProductsInCart = quantityOfProductInCart + 1

      const quantityOfProductInStock = await api.get(`/stock/${productId}`)
        .then(response => response.data.amount)

      if(newQuantityOFProductsInCart > quantityOfProductInStock) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      } 

      if (productExistsInCart) {
        productExistsInCart.amount = newQuantityOFProductsInCart
      } else {
        const product = await api.get(`/products/${productId}`)
        const newProduct = {...product.data, amount: 1}
        cartCopy.push(newProduct)
      }
        setCart(cartCopy)
        updateLocalStorage(cartCopy)
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      let cartCopy = [...cart]
      const productNotExists = cartCopy.find(product => Object.is(product.id, productId)) ? false : true
      if(productNotExists) throw new Error()
      cartCopy = cartCopy.filter(product => product.id !== productId)
      setCart(cartCopy)
      updateLocalStorage(cartCopy)
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if( amount <= 0) {
        return
      }
      let cartCopy = [...cart]
      const productInCart = cartCopy.find(product => Object.is(product.id, productId))

      if(!productInCart) throw new Error()

      const productInStock = await api.get<UpdateProductAmount>(`/stock/${productId}`)
      const quantityOfProductInStock = productInStock.data.amount


      if(quantityOfProductInStock < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      }


      cartCopy = cartCopy.map(product => {
        if(product.id !== productId) {
          return product
        } else {
          return {...product, amount}
        }
      })

      setCart(cartCopy)

      updateLocalStorage(cartCopy)
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
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
