import { useState, useEffect, useRef } from 'react'
import { projectFirestore } from '../firebase/config'

export const useCollection = (collection, _query, _orderBy) => {
  const [documents, setDocuments] = useState(null)
  const [error, setError] = useState(null)

  // PREVENTS INFINITE LOOP DUE TO REFERENCE TYPE (query) BEING PASSED AS A DEPENDENCY AT THE END OF THE useEffect HOOK
  // REFERENCE TYPES (arrays, etc.) ARE ALWAYS CONSIDERED DIFFERENT ONN EVERY FUNCTION CALL, AND WILL CAUSE AN INFINITE LOOP
  // THIS IS BECAUSE THE HOOK WILL RE-RUN EVERY TIME IT CHECKS THE REFERENCE IN THE DEPENDENCIES
  // WRAPPING IN A useRef HOOK WILL PREVENT THE ARRAY FROM APPEARING DIFFERENT EVERY TIME
  const query = useRef(_query).current
  const orderBy = useRef(_orderBy).current

  useEffect(() => {
    let ref = projectFirestore.collection(collection)

    if (query) {
      ref = ref.where(...query)
    }
    if (orderBy) {
      ref = ref.orderBy(...orderBy)
    }

    const unsubscribe = ref.onSnapshot((snapshot) => {
      let results = []
      snapshot.docs.forEach(doc => {
        results.push({ ...doc.data(), id: doc.id })
      })

      //UPDATE STATE
      setDocuments(results)
      setError(null)
    }, (error) => {
      console.log(error)
      setError('Could not fetch the data')
    })

    // UNSUBSCRIBE ON UNMOUNT
    return () => unsubscribe()

  }, [collection, query, orderBy])

  return { documents, error }
}