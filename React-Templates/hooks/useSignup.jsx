import { useState, useEffect } from 'react'
import { projectAuth, projectStorage, projectFirestore } from '../../../project-management/src/firebase/config'
import { useAuthContext } from '../../../project-management/src/hooks/useAuthContext'

export const useSignup = () => {
  const [isCanceled, setIsCanceled] = useState(false)
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const { dispatch } = useAuthContext()

  const signup = async (email, password, displayName, thumbnail) => {
    setError(null)
    setIsPending(true)

    try {
//SIGNUP USER
      const res = await projectAuth.createUserWithEmailAndPassword(email, password)

      if (!res) {
        throw new Error('Could not complete signup')
      }


//UPLOAD USER THUMBNAIL
      const uploadPath = `thumbnails/${res.user.uid}/${thumbnail.name}`
      const img = await projectStorage.ref(uploadPath).put(thumbnail)
      const imgUrl = await img.ref.getDownloadURL()


//ADD DISPLAY NAME TO USER
      await res.user.updateProfile({ displayName, photoURL: imgUrl })

//CREATE A USER DOCUMENT
      await projectFirestore.collection('users').doc(res.user.uid).set({
        online: true,
        displayName,
        photoURL: imgUrl
      })

//DISPATCH LOGIN ACTION
      dispatch({ type: 'LOGIN', payload: res.user })

//UPDATE STATE
      if (!isCanceled) {
        if (!isCanceled) {
          setIsPending(false)
          setError(null)
        }
      }
    } catch (err) {
      console.log(err.message)
      setError(err.message)
      setIsPending(false)
    }
  }

  useEffect(() => {
    return () => setIsCanceled(true)
  }, [])

  return { error, isPending, signup }

}