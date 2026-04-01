import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { transactionsAPI } from '../services/api'

function PayFine() {
  const { transactionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [transaction, setTransaction] = useState(null)
  const [fine, setFine] = useState(null)
  const [formData, setFormData] = useState({
    paid_fine: '',
    remarks: ''
  })
  const [errors, setErrors] = useState({})
  const [finePaid, setFinePaid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTransactionDetails()
  }, [transactionId])

  const fetchTransactionDetails = async () => {
    try {
      const response = await transactionsAPI.getTransaction(transactionId)
      setTransaction(response.data)

      const calculatedFine = response.data.calculated_fine || 0
      setFine(calculatedFine)
      setFormData(prev => ({
        ...prev,
        paid_fine: calculatedFine > 0 ? calculatedFine : ''
      }))
    } catch (err) {
      setError('Failed to load transaction details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (fine && fine > 0 && !finePaid) {
      newErrors.finePaid = 'Fine paid checkbox must be checked'
    }

    if (fine && fine > 0 && !formData.paid_fine) {
      newErrors.paid_fine = 'Paid fine amount is required'
    }

    if (formData.paid_fine && parseFloat(formData.paid_fine) < fine) {
      newErrors.paid_fine = 'Paid fine cannot be less than calculated fine'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      if (fine && fine > 0) {
        await transactionsAPI.payFine(transactionId, {
          paid_fine: parseFloat(formData.paid_fine)
        })
      }

      alert('✅ Book return transaction completed successfully!')
      navigate('/')
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to pay fine' })
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading fine details...</div>
  }

  if (!transaction) {
    return <div className="error-message">Transaction not found</div>
  }

  return (
    <div>
      <h1>💰 Pay Fine</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Transaction Details */}
        <div style={{ padding: '20px', backgroundColor: '#ecf0f1', borderRadius: '4px', marginBottom: '20px' }}>
          <h3>Transaction Details</h3>
          <div className="form-row">
            <div>
              <p><strong>Book Title:</strong> {transaction.title}</p>
              <p><strong>Author:</strong> {transaction.author}</p>
              <p><strong>Member:</strong> {transaction.member_name}</p>
            </div>
            <div>
              <p><strong>Issue Date:</strong> {transaction.issue_date}</p>
              <p><strong>Planned Return Date:</strong> {transaction.return_date}</p>
              <p><strong>Actual Return Date:</strong> {transaction.actual_return_date}</p>
            </div>
          </div>
        </div>

        {/* Fine Details */}
        <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '4px', marginBottom: '20px' }}>
          <h3>Fine Details</h3>
          <p><strong>Calculated Fine:</strong> ${fine ? fine.toFixed(2) : '0.00'}</p>
          {fine > 0 && (
            <div className="error-message" style={{ marginTop: '10px' }}>
              ⚠️ Fine is due: ${fine.toFixed(2)}
            </div>
          )}
          {!fine || fine === 0 && (
            <div className="success-message" style={{ marginTop: '10px' }}>
              ✅ No fine is due. You can complete the transaction.
            </div>
          )}
        </div>

        {/* Fine Payment Section */}
        {fine && fine > 0 && (
          <>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={finePaid}
                  onChange={(e) => setFinePaid(e.target.checked)}
                />
                I confirm that the fine has been paid
              </label>
              {errors.finePaid && <div className="error">{errors.finePaid}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Paid Fine Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.paid_fine}
                  onChange={(e) => setFormData(prev => ({ ...prev, paid_fine: e.target.value }))}
                  placeholder="Enter paid fine amount"
                  disabled={!finePaid}
                />
                {errors.paid_fine && <div className="error">{errors.paid_fine}</div>}
              </div>

              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Enter any remarks"
                  disabled={!finePaid}
                />
              </div>
            </div>
          </>
        )}

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <button type="submit" disabled={submitting} className="btn-success">
          {submitting ? 'Processing...' : '✅ Complete Transaction'}
        </button>
      </form>
    </div>
  )
}

export default PayFine
