import { Navigate } from 'react-router-dom'
import HomePage from '../pages/home/HomePage'
import MoviesPage from '../pages/movies/MoviesPage'
import MovieDetailsPage from '../pages/movies/MovieDetailsPage'
import SeriesPage from '../pages/series/SeriesPage'
import WallpapersPage from '../pages/media/WallpapersPage'
import LogosPage from '../pages/media/LogosPage'
import PostersPage from '../pages/media/PostersPage'
import BackdropsPage from '../pages/media/BackdropsPage'
import SearchPage from '../pages/search/SearchPage'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminImportTMDB from '../pages/admin/AdminImportTMDB'
import AdminMediaManager from '../pages/admin/AdminMediaManager'
import Persons from '../pages/persons/PersonsPage'
import PersonDetails from '../pages/persons/PersonDetailsPage'
import AdminAddPerson from '../pages/admin/AdminAddPerson'
import AdminAddMovie from '../pages/admin/AdminAddMovie'
import SignInPage from '../pages/auth/SignInPage'
import HomepageSectionsManager from '../pages/admin/HomepageSectionsManager'

export const routes = [
  { path: '/', element: <HomePage /> },
  { path: '/movies', element: <MoviesPage /> },
  { path: '/movie/:id', element: <MovieDetailsPage /> },
  { path: '/series', element: <SeriesPage /> },
  { path: '/wallpapers', element: <WallpapersPage /> },
  { path: '/logos', element: <LogosPage /> },
  { path: '/posters', element: <PostersPage /> },
  { path: '/backdrops', element: <BackdropsPage /> },
  { path: '/search', element: <SearchPage /> },
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/admin/import', element: <AdminImportTMDB /> },
  { path: '/admin/media', element: <AdminMediaManager /> },
  { path: '/admin/add-movie', element: <AdminAddMovie /> },
  { path: '/admin/add-person', element: <AdminAddPerson /> },
  { path: '/admin/homepage-sections', element: <HomepageSectionsManager /> },
  { path: '/persons', element: <Persons /> },
  { path: '/person/:id', element: <PersonDetails /> },
  { path: '/signin', element: <SignInPage /> },
  { path: '*', element: <Navigate to="/" replace /> }
]
