import { useReducer, useEffect, useState } from 'react'
import { projectFirestore, timestamp } from '../../../project-management/src/firebase/config'

let initialState = {
  document: null,
  isPending: false,
  error: null,
  success: null
}

const firestoreReducer = (state, action) => {
  switch (action.type) {
    case 'IS_PENDING':
      return { success: null, isPending: true, error: null, document: null }
    case 'ADDED_DOC':
      return { success: true, isPending: false, error: null, document: action.payload }
    case 'DELETED_DOC':
      return { success: true, isPending: false, error: null, document: null }
    case 'ERROR':
      return { success: null, isPending: false, error: action.payload, document: null }
    default:
      return state
  }
}

export const useFirestore = (collection) => {
  const [response, dispatch] = useReducer(firestoreReducer, initialState)
  const [isCanceled, setIsCanceled] = useState(false)

  // collection ref
  const ref = projectFirestore.collection(collection)

  // only dispatch if not cancelled
  const dispatchIfNotCanceled = (action) => {
    if (!isCanceled) {
      dispatch(action)
    }
  }

  // add a document
  const addDocument = async (doc) => {
    dispatch({ type: 'IS_PENDING' })

    try {
      const createdAt = timestamp.fromDate(new Date())
      const addedDocument = await ref.add({ ...doc, createdAt })
      dispatchIfNotCanceled({ type: 'ADDED_DOC', payload: addedDocument })
    } catch (err) {
      dispatchIfNotCanceled({ type: 'ERROR', payload: err.message })
    }
  }

  // delete a document
  const deleteDocument = async (id) => {
    dispatch({ type: 'IS_PENDING' })

    try {
      await ref.doc(id).delete()
      dispatchIfNotCanceled({ type: 'DELETED_DOC' })
    } catch (err) {
      dispatchIfNotCanceled({ type: 'ERROR', payload: 'Could not delete' })
    }
  }

  useEffect(() => {
    return () => setIsCanceled(true)
  }, [])

  return { addDocument, deleteDocument, response }

}