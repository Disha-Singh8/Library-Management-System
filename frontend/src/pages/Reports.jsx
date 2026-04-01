import React, { useState, useEffect } from 'react'
import { reportsAPI } from '../services/api'

function Reports({ user }) {
  const [reportType, setReportType] = useState('transactions')
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReport()
  }, [reportType])

  const fetchReport = async () => {
    setLoading(true)
    setError('')
    setReportData([])

    try {
      let response
      switch (reportType) {
        case 'transactions':
          response = await reportsAPI.getTransactionReport()
          break
        case 'membership':
          response = await reportsAPI.getMembershipReport()
          break
        case 'pending-fines':
          response = await reportsAPI.getPendingFinesReport()
          break
        case 'books':
          response = await reportsAPI.getBooksReport()
          break
        default:
          response = { data: [] }
      }
      setReportData(response.data)
    } catch (err) {
      setError(`Failed to load ${reportType} report`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>📑 Reports</h1>

      <div className="form-group" style={{ marginBottom: '30px' }}>
        <label>Select Report Type</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="reportType"
              value="transactions"
              checked={reportType === 'transactions'}
              onChange={(e) => setReportType(e.target.value)}
            />
            Transaction Report
          </label>
          <label>
            <input
              type="radio"
              name="reportType"
              value="membership"
              checked={reportType === 'membership'}
              onChange={(e) => setReportType(e.target.value)}
            />
            Membership Report
          </label>
          <label>
            <input
              type="radio"
              name="reportType"
              value="pending-fines"
              checked={reportType === 'pending-fines'}
              onChange={(e) => setReportType(e.target.value)}
            />
            Pending Fines Report
          </label>
          <label>
            <input
              type="radio"
              name="reportType"
              value="books"
              checked={reportType === 'books'}
              onChange={(e) => setReportType(e.target.value)}
            />
            Books Report
          </label>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading">Loading report...</div>}

      {!loading && reportData.length === 0 && !error && (
        <div className="message info">No data available for this report</div>
      )}

      {!loading && reportData.length > 0 && (
        <div>
          {reportType === 'transactions' && (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Book</th>
                  <th>Author</th>
                  <th>Member</th>
                  <th>Issue Date</th>
                  <th>Return Date</th>
                  <th>Actual Return</th>
                  <th>Status</th>
                  <th>Fine</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map(row => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.title}</td>
                    <td>{row.author}</td>
                    <td>{row.member_name}</td>
                    <td>{row.issue_date}</td>
                    <td>{row.return_date}</td>
                    <td>{row.actual_return_date || '-'}</td>
                    <td>{row.status}</td>
                    <td>${row.calculated_fine ? row.calculated_fine.toFixed(2) : '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'membership' && (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map(row => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.name}</td>
                    <td>{row.email || '-'}</td>
                    <td>{row.phone || '-'}</td>
                    <td>{row.membership_type}</td>
                    <td>{row.membership_start_date}</td>
                    <td>{row.membership_end_date}</td>
                    <td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'pending-fines' && (
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Book</th>
                  <th>Author</th>
                  <th>Member</th>
                  <th>Return Date</th>
                  <th>Actual Return</th>
                  <th>Fine Amount</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map(row => (
                  <tr key={row.transaction_id}>
                    <td>{row.transaction_id}</td>
                    <td>{row.title}</td>
                    <td>{row.author}</td>
                    <td>{row.member_name}</td>
                    <td>{row.return_date}</td>
                    <td>{row.actual_return_date || '-'}</td>
                    <td>${row.calculated_fine.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'books' && (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Serial No</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map(row => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.title}</td>
                    <td>{row.author}</td>
                    <td>{row.isbn || '-'}</td>
                    <td>{row.serial_no}</td>
                    <td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default Reports
