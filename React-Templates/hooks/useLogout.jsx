import { useState, useEffect } from 'react'
import { projectAuth, projectFirestore } from '../firebase/config'
import { useAuthContext } from './useAuthContext'

export const useLogout = () => {
  const [isCanceled, setIsCanceled] = useState(false)
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const { dispatch } = useAuthContext()

  const logout = async () => {
    setError(null)
    setIsPending(true)

    try {
//UPDATE ONLINE STATUS
      const { uid } = projectAuth.currentUser
      await projectFirestore.collection('users').doc(uid).update({ online: false })

//SIGN USER OUT
      await projectAuth.signOut()

//DISPATCH LOGOUT ACTION
      dispatch({ type: 'LOGOUT' })

//UPDATE STATE
      if (!isCanceled) {
        setIsPending(false)
        setError(null)
      }
    } catch (err) {
      if (!isCanceled) {
        console.log(err.message)
        setError(err.message)
        setIsPending(false)
      }
    }
  }

  useEffect(() => {
    setIsCanceled(false)
    return () => setIsCanceled(true)
  }, [])

  return { logout, isPending, error }
}

