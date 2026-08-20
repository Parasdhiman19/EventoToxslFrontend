import React from 'react'
import { BrowserRouter , Route , Routes  } from 'react-router-dom'
import AuthLayout from './layouts/AuthLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
   <BrowserRouter>
    <Routes>
     <Route path='/Account' element={<AuthLayout/>}>
     <Route  path='login' element={<Login/>}/>
     <Route  path='signup' element={<Signup/>}/>
     </Route>
    </Routes>
   </BrowserRouter>
  )
}

export default App