import { User } from '../models/User.js'

export const listUsers = async (req, res) => {
  try {
    const { q, role, active, page = 1, limit = 20, sort = '-createdAt' } = req.query

    const filter = {}
    if (q) {
      const s = String(q).trim()
      filter.$or = [
        { name: new RegExp(s, 'i') },
        { email: new RegExp(s, 'i') },
        { username: new RegExp(s, 'i') },
      ]
    }
    if (role) filter.role = role
    if (typeof active !== 'undefined') filter.active = String(active) === 'true'

    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20))
    const skip = (pageNum - 1) * limitNum

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter, 'name email username role active createdAt')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
    ])

    res.json({
      data: users,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to list users' })
  }
}

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body || {}
    if (!['member', 'exec', 'admin'].includes(String(role))) {
      return res.status(400).json({ message: 'Invalid role' })
    }
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    user.role = role
    await user.save()
    res.json({ id: user._id, role: user.role })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update role' })
  }
}

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { active } = req.body || {}
    if (typeof active === 'undefined') return res.status(400).json({ message: 'active is required' })
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    user.active = Boolean(active)
    await user.save()
    res.json({ id: user._id, active: user.active })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status' })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findByIdAndDelete(id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' })
  }
}

export const exportUsersCSV = async (req, res) => {
  try {
    const { q, role, active, sort = '-createdAt' } = req.query
    const filter = {}
    if (q) {
      const s = String(q).trim()
      filter.$or = [
        { name: new RegExp(s, 'i') },
        { email: new RegExp(s, 'i') },
        { username: new RegExp(s, 'i') },
      ]
    }
    if (role) filter.role = role
    if (typeof active !== 'undefined') filter.active = String(active) === 'true'

    const users = await User.find(filter, 'name email username role active createdAt').sort(sort)

    const header = ['id','name','email','username','role','active','createdAt']
    const rows = users.map(u => [u._id, u.name, u.email, u.username, u.role, u.active, u.createdAt?.toISOString?.() || ''])
    const csv = [header.join(','), ...rows.map(r => r.map(v => {
      const s = String(v ?? '')
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
    }).join(','))].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"')
    res.send(csv)
  } catch (err) {
    res.status(500).json({ message: 'Failed to export users' })
  }
}
