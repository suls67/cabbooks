import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getCurrentDriver } from '../lib/driverAuth'
import { supabase } from '../supabaseClient'
import styles from '../styles/customers.module.css'

const CUSTOMER_TYPES = ['Private hire', 'Account work', 'School', 'Business']

function getInitials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <circle cx="10" cy="4" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="10" cy="16" r="1.5" />
    </svg>
  )
}

const BLANK_FORM = { name: '', phone: '', email: '', type: 'Private hire', area: '', notes: '' }

export default function Customers() {
  const router = useRouter()
  const [driver, setDriver] = useState(null)
  const [customers, setCustomers] = useState([])
  const [tab, setTab] = useState('active')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)

  const loadCustomers = useCallback(async (driverId) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('driver_id', driverId)
      .order('name', { ascending: true })
    if (!error) setCustomers(data || [])
  }, [])

  useEffect(() => {
    async function init() {
      try {
        const d = await getCurrentDriver(supabase)
        setDriver(d)
        await loadCustomers(d.id)
      } catch (err) {
        const text = err instanceof Error ? err.message : ''
        if (text === 'No signed-in user was found') router.push('/login')
      }
    }
    init()
  }, [router, loadCustomers])

  useEffect(() => {
    if (!openMenuId) return
    function handleClickOutside() { setOpenMenuId(null) }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openMenuId])

  function openAdd() {
    setEditing(null)
    setForm(BLANK_FORM)
    setFormError('')
    setShowModal(true)
  }

  function openEdit(customer) {
    setEditing(customer)
    setForm({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      type: customer.type,
      area: customer.area || '',
      notes: customer.notes || '',
    })
    setFormError('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditing(null)
    setFormError('')
  }

  async function handleSave() {
    if (!form.name.trim()) { setFormError('Customer name is required.'); return }
    setIsSaving(true)
    setFormError('')
    const payload = {
      driver_id: driver.id,
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      type: form.type,
      area: form.area.trim() || null,
      notes: form.notes.trim() || null,
    }
    let error
    if (editing) {
      ;({ error } = await supabase.from('customers').update(payload).eq('id', editing.id))
    } else {
      ;({ error } = await supabase.from('customers').insert([{ ...payload, status: 'active' }]))
    }
    setIsSaving(false)
    if (error) { setFormError(`Could not save: ${error.message}`); return }
    closeModal()
    await loadCustomers(driver.id)
  }

  async function handleToggleStatus(customer) {
    const newStatus = customer.status === 'active' ? 'inactive' : 'active'
    await supabase.from('customers').update({ status: newStatus }).eq('id', customer.id)
    await loadCustomers(driver.id)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this customer?')) return
    await supabase.from('customers').delete().eq('id', id)
    await loadCustomers(driver.id)
  }

  const visible = customers.filter(c => c.status === tab)
  const activeCount = customers.filter(c => c.status === 'active').length
  const inactiveCount = customers.filter(c => c.status === 'inactive').length

  return (
    <div className={styles.page}>

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Customers</h1>
          <p className={styles.pageSubtitle}>Set up and manage your customer list for invoicing.</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>Add customer</button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'active' ? styles.tabActive : ''}`} onClick={() => setTab('active')}>
          Active {activeCount > 0 && <span className={styles.tabBadge}>{activeCount}</span>}
        </button>
        <button className={`${styles.tab} ${tab === 'inactive' ? styles.tabActive : ''}`} onClick={() => setTab('inactive')}>
          Inactive {inactiveCount > 0 && <span className={styles.tabBadge}>{inactiveCount}</span>}
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        {visible.length > 0 ? (
          <div className={styles.table}>
            {/* Header */}
            <div className={styles.tableHead}>
              <div className={styles.colName}>Customer</div>
              <div className={styles.colEmail}>Email address</div>
              <div className={styles.colPhone}>Phone number</div>
              <div className={styles.colArea}>Area</div>
              <div className={styles.colType}>Type</div>
              <div className={styles.colActions}>Actions</div>
            </div>

            {/* Rows */}
            {visible.map(c => (
              <div key={c.id} className={styles.tableRow}>
                <div className={styles.colName}>
                  <div className={styles.avatar}>{getInitials(c.name)}</div>
                  <div className={styles.nameBlock}>
                    <div className={styles.customerName}>{c.name}</div>
                    {/* Mobile only: type + phone + area */}
                    <div className={styles.mobileDetails}>
                      <span className={`${styles.typeBadge} ${styles[`type${c.type.replace(/\s+/g, '')}`]}`}>{c.type}</span>
                      {c.phone && <span className={styles.mobileDetailItem}>{c.phone}</span>}
                      {c.area && <span className={styles.mobileDetailItem}>{c.area}</span>}
                    </div>
                  </div>
                </div>
                <div className={styles.colEmail}>{c.email || <span className={styles.dash}>—</span>}</div>
                <div className={styles.colPhone}>{c.phone || <span className={styles.dash}>—</span>}</div>
                <div className={styles.colArea}>{c.area || <span className={styles.dash}>—</span>}</div>
                <div className={styles.colType}>
                  <span className={`${styles.typeBadge} ${styles[`type${c.type.replace(/\s+/g, '')}`]}`}>{c.type}</span>
                </div>
                <div className={styles.colActions}>
                  <div className={styles.menuWrap}>
                    <button
                      className={styles.menuBtn}
                      onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === c.id ? null : c.id) }}
                    >
                      <DotsIcon />
                      <span>Actions</span>
                    </button>
                    {openMenuId === c.id && (
                      <div className={styles.menuDropdown}>
                        <button className={styles.menuItem} onClick={() => { openEdit(c); setOpenMenuId(null) }}>Edit</button>
                        <button className={styles.menuItem} onClick={() => { handleToggleStatus(c); setOpenMenuId(null) }}>
                          {c.status === 'active' ? 'Mark as inactive' : 'Mark as active'}
                        </button>
                        <div className={styles.menuDivider} />
                        <button className={`${styles.menuItem} ${styles.menuItemDelete}`} onClick={() => { handleDelete(c.id); setOpenMenuId(null) }}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className={styles.tableFooter}>
              <span>{visible.length} {visible.length === 1 ? 'customer' : 'customers'}</span>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>
              {tab === 'active' ? 'No customers yet' : 'No inactive customers'}
            </div>
            <div className={styles.emptySub}>
              {tab === 'active'
                ? 'Add your first customer to start creating invoices.'
                : 'Customers you mark as inactive will appear here.'}
            </div>
            {tab === 'active' && (
              <button className={styles.addBtn} onClick={openAdd}>Add customer</button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.backdrop} onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>{editing ? 'Edit customer' : 'Add a customer'}</span>
              <button className={styles.closeBtn} onClick={closeModal}><CloseIcon /></button>
            </div>

            {formError && <div className={styles.formError}>{formError}</div>}

            <div className={styles.field}>
              <label className={styles.label}>Name <span className={styles.req}>*</span></label>
              <input className={styles.input} type="text" placeholder="e.g. Heathrow Cars Ltd"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Phone</label>
                <input className={styles.input} type="tel" placeholder="07700 900000"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Type</label>
                <select className={styles.select} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {CUSTOMER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" placeholder="billing@company.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Area / Pickup location</label>
              <input className={styles.input} type="text" placeholder="e.g. Heathrow, Central London"
                value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Notes <span className={styles.optional}>(optional)</span></label>
              <textarea className={`${styles.input} ${styles.textarea}`}
                placeholder="e.g. Always needs a receipt, wheelchair accessible vehicle"
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
            </div>

            <div className={styles.formActions}>
              <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : editing ? 'Save changes' : 'Add customer'}
              </button>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
