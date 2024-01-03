/*
 * @作者: kerwin
 */
import {configureStore} from '@reduxjs/toolkit'
import balanceSlice from './slices/balanceSlice'
import orderSlice from './slices/orderSlice'
const store = configureStore({
    reducer:{
        //余额reducer
        balance:balanceSlice,
        order:orderSlice
        //订单reducer
    },
    middleware:getDefaultMiddleware => getDefaultMiddleware({
        serializableCheck:false
    })
    // middleware: ...
})

export default store