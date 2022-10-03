import { useState, useEffect } from 'react'
import { projectAuth, projectFirestore } from '../../../project-management/src/firebase/config'
import { useAuthContext } from '../../../project-management/src/hooks/useAuthContext'

export const useLogin = () => {
  const [isCanceled, setIsCanceled] = useState(false)
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const { dispatch } = useAuthContext()

  const login = async (email, password) => {
    setError(null)
    setIsPending(true)

//LOGIN
    try {
      const res = await projectAuth.signInWithEmailAndPassword(email, password)

//UPDATE ONLINE STATUS
      await projectFirestore.collection('users').doc(res.user.uid).update({ online: true })

//DISPATCH LOGIN ACTION
      dispatch({ type: 'LOGIN', payload: res.user })

//UPDATE STATE
      if (!isCanceled) {
        setIsPending(false)
        setError(null)
      }
    } catch (err) {
      if (!isCanceled) {
        console.log(err)
        setError(err.message)
        setIsPending(false)
      }
    }
  }


  useEffect(() => {
    setIsCanceled(false)
    return () => setIsCanceled(true)
  }, [])

  return { login, error, isPending }
}