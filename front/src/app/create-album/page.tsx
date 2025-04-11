'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { BiArrowBack } from 'react-icons/bi'

interface CreateAlbumPayload {
  name: string
  description: string
  releaseDate: string
  albumPic?: File | null
}

const CreateAlbum = () => {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [albumPic, setAlbumPic] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string>('user')

  // Check authentication and role
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const role = localStorage.getItem('userRole') ?? 'user'
      
      setIsAuthenticated(!!token)
      setUserRole(role)
      
      if (!token) {
        router.push('/login')
        return
      }
      
      // If user is not an artist, redirect to home
      if (role !== 'artist') {
        router.push('/')
      }
    }
  }, [router])

  const createAlbumMutation = useMutation({
    mutationFn: async (payload: CreateAlbumPayload) => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication required')

      // First create the album
      const response = await axios.post('http://localhost:8787/albums/create', {
        name: payload.name,
        description: payload.description,
        releaseDate: payload.releaseDate
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // If album pic is provided, upload it
      if (payload.albumPic && response.data.id) {
        const formData = new FormData()
        formData.append('albumPic', payload.albumPic)
        
        await axios.post(`http://localhost:8787/albums/${response.data.id}/upload`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
      }

      return response.data
    },
    onSuccess: (data) => {
      setMessage('Album created successfully!')
      // Redirect to home page after successful creation
      setTimeout(() => {
        router.push('/')
      }, 2000)
    },
    onError: (error: any) => {
      setMessage(error.response?.data?.error || 'Error creating album')
      console.error(error)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !description || !releaseDate) {
      setMessage('Please fill all required fields')
      return
    }
    
    createAlbumMutation.mutate({
      name,
      description,
      releaseDate,
      albumPic
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAlbumPic(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (!isAuthenticated || userRole !== 'artist') {
    return null // Don't render anything while checking auth or redirecting
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center text-[#b3b3b3] hover:text-white mb-8"
        >
          <BiArrowBack className="mr-2" /> Back to Home
        </button>
        
        <h1 className="text-3xl font-bold mb-8">Create New Album</h1>
        
        {message && (
          <div className={`p-4 mb-6 rounded ${message.includes('success') ? 'bg-[rgba(30,215,96,0.1)] text-[#1ed760]' : 'bg-[rgba(255,0,0,0.1)] text-red-500'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-bold">
              Album Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter album name"
              required
              className="w-full p-3 border border-[#878787] rounded bg-[#242424] text-white text-base focus:outline-none focus:border-[#1ed760]"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block mb-2 text-sm font-bold">
              Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter album description"
              required
              rows={4}
              className="w-full p-3 border border-[#878787] rounded bg-[#242424] text-white text-base focus:outline-none focus:border-[#1ed760]"
            />
          </div>
          
          <div>
            <label htmlFor="releaseDate" className="block mb-2 text-sm font-bold">
              Release Date *
            </label>
            <input
              id="releaseDate"
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              required
              className="w-full p-3 border border-[#878787] rounded bg-[#242424] text-white text-base focus:outline-none focus:border-[#1ed760]"
            />
          </div>
          
          <div>
            <label htmlFor="albumPic" className="block mb-2 text-sm font-bold">
              Album Cover
            </label>
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <input
                  id="albumPic"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="albumPic"
                  className="block w-full p-3 border border-dashed border-[#878787] rounded bg-[#242424] text-[#b3b3b3] text-center cursor-pointer hover:border-[#1ed760] hover:text-white transition-colors"
                >
                  {albumPic ? albumPic.name : 'Choose an image file'}
                </label>
                <p className="mt-2 text-xs text-[#b3b3b3]">
                  Recommended: Square image, at least 500x500 pixels
                </p>
              </div>
              
              {previewUrl && (
                <div className="w-24 h-24 overflow-hidden rounded">
                  <img
                    src={previewUrl}
                    alt="Album cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={createAlbumMutation.isPending}
            className={`w-full py-3 bg-[#1ed760] text-black font-bold rounded-full text-base hover:bg-[#1fdf64] hover:scale-[1.04] transition ${
              createAlbumMutation.isPending ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {createAlbumMutation.isPending ? "Creating Album..." : "Create Album"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateAlbum
