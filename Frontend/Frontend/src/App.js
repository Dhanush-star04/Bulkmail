import React, { useState } from 'react';
import Login from './Login';

const ITEMS_PER_PAGE = 5;
const API_URL = 'https://bulkmail-flame.vercel.app';

export default function App() {
  const [admin, setAdmin] = useState(() => localStorage.getItem('bulkmail_admin'));

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [fileName, setFileName] = useState('No file chosen');
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('compose');
  const [historyPage, setHistoryPage] = useState(0);

  if (!admin) {
    return <Login onLogin={(email) => setAdmin(email)} />;
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const text = evt.target.result;
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const foundEmails = text.match(emailRegex) || [];
      const uniqueEmails = [...new Set(foundEmails)];
      setRecipients(uniqueEmails);
    };

    reader.readAsText(file);
  };

  const sendEmails = async (e) => {
    e.preventDefault();

    if (recipients.length === 0) {
      setStatus({ loading: false, message: 'Upload a CSV file with at least one recipient.', type: 'error' });
      return;
    }

    setStatus({ loading: true, message: '', type: '' });

    try {
      const response = await fetch(`${API_URL}/api/sendemail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message: body, emailList: recipients })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ loading: false, message: 'Emails sent successfully!', type: 'success' });
        setSubject('');
        setBody('');
        setRecipients([]);
        setFileName('No file chosen');
      } else {
        setStatus({ loading: false, message: data.error || 'Failed to send emails.', type: 'error' });
      }
    } catch (error) {
      setStatus({ loading: false, message: 'Network error. Make sure backend is running.', type: 'error' });
    }
  };

  const fetchHistory = async () => {
    setView('history');
    setHistoryPage(0);
    try {
      const response = await fetch(`${API_URL}/api/gethistory`);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bulkmail_admin');
    setAdmin(null);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="w-full px-8 py-6 border-b border-zinc-800 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-red-600 tracking-tight">BulkMail</h1>
          <p className="text-sm text-zinc-400 mt-1">Send multiple emails at once with ease</p>
        </div>
        <div className="flex items-center">
          {view === 'compose' ? (
            <button onClick={fetchHistory} className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition duration-200 shadow-md shadow-red-900/30">
              Email History
            </button>
          ) : (
            <button onClick={() => setView('compose')} className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm border border-zinc-700 transition duration-200">
              Compose Mail
            </button>
          )}
          <button onClick={handleLogout} className="ml-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm border border-zinc-700 transition duration-200">
            Logout
          </button>
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto p-6 my-8">
        {view === 'compose' ? (
          <div className="max-w-xl mx-auto bg-zinc-950 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={sendEmails} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Subject</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required
                  placeholder="Write your subject content here..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-lg p-3 text-sm text-white placeholder-zinc-500 outline-none transition" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Email Content</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows="5"
                  placeholder="Write your email content here..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-lg p-3 text-sm text-white placeholder-zinc-500 outline-none transition resize-y" />
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-300">
                  <span>Upload Recipient List (.csv)</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <label className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition border border-zinc-700">
                    Choose File
                    <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <span className="text-xs text-zinc-400 truncate max-w-[180px]">{fileName}</span>
                </div>
                <p className="text-xs text-red-400 font-medium">
                  Total recipients: <span className="font-bold text-white">{recipients.length}</span>
                </p>
              </div>

              <div className="flex justify-center pt-2">
                <button type="submit" disabled={status.loading}
                  className={`flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-bold text-sm transition duration-200 ${
                    status.loading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-lg shadow-red-900/40 cursor-pointer'
                  }`}>
                  <span>{status.loading ? 'Sending...' : 'Send'}</span>
                </button>
              </div>
            </form>

            {status.message && (
              <div className={`mt-6 p-3 rounded-lg border text-sm text-center font-medium ${
                status.type === 'error' ? 'bg-red-950/40 text-red-400 border-red-800/60' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
              }`}>
                {status.message}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-red-600">Email History</h2>
              <button onClick={() => setView('compose')}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition duration-200 shadow-md shadow-red-900/30">
                Send mails
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-zinc-500 text-center py-16">No email records found.</p>
            ) : (() => {
              const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
              const paginated = history.slice(historyPage * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE);
              return (
                <div className="relative">
                  {historyPage > 0 && (
                    <button onClick={() => setHistoryPage((p) => p - 1)}
                      className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white flex items-center justify-center shadow-lg">
                      ‹
                    </button>
                  )}
                  {historyPage < totalPages - 1 && (
                    <button onClick={() => setHistoryPage((p) => p + 1)}
                      className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white flex items-center justify-center shadow-lg">
                      ›
                    </button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {paginated.map((record) => (
                      <div key={record._id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm hover:border-red-600/50 transition">
                        <h3 className="font-semibold text-red-500 text-base mb-1 truncate">{record.subject}</h3>
                        <p className="text-sm text-zinc-400 mb-3 truncate">{record.body}</p>
                        <p className="text-xs text-zinc-500 mb-1 truncate">
                          <span className="text-zinc-600">Recipients: </span>
                          <span className="text-red-400">
                            {Array.isArray(record.emailList) ? record.emailList.join(', ') : record.emailList}
                          </span>
                        </p>
                        <p className="text-xs text-zinc-600">Sent on {new Date(record.time).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
}