/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Select, MenuItem, FormControl, InputLabel, Modal, Box, Typography, TablePagination, Rating, TextField, CircularProgress } from '@mui/material';
import { ApiResponse, Generes, Movie, Rewview } from './types/movies';

const App = () => {
  const urlApi = import.meta.env.VITE_API_BASE_URL;
  const [genres, setGenres] = useState<Generes[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [reviews, setReviews] = useState<Rewview[]>([]);
  const [loading, setLoading] = useState(false);
  const [moviesResponse, setMoviesResponse] = useState<ApiResponse<Movie>>(
    { page: 1, total_results: 0, total_pages: 0, results: [] }
  );
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(
    { id: 0, title: '', release_date: new Date(), poster_path: '', overview: '', vote_average: 0 }
  );
  const [openModal, setOpenModal] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'| null>('asc');
  const [orderBy, setOrderBy] = useState<'title' | 'vote_average' | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [userRating, setUserRating] = useState<number | null>(0);
  const [userReview, setUserReview] = useState('');

  const fetchMovies = async () => {
    if(loading) return;
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse<Movie>>(`${urlApi}/api/movies/getMoviesList`, {
        params: { 
          genre: selectedGenre, 
          rating: selectedRating, 
          year: selectedYear, 
          page: page + 1, 
          sortBy:orderBy+'.'+order,
        }
      });
      setMoviesResponse(response.data);
      setMovies(response.data.results);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false); 
    }
  };
  const fetchReviews = async (movieId:number) => {
    try {
      const response = await axios.get(`${urlApi}/api/movies/${movieId}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };
  

  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${urlApi}/api/movies/getGenresList`);
      setGenres(response.data.genres);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const submitReview = async () => {
    setLoading(true);
    try {
      await axios.post(`${urlApi}/api/movies/rateMovie`, {
        movieId: selectedMovie?.id,
        userRating,
        review: userReview
      });
      if (selectedMovie) {
        fetchReviews(selectedMovie.id);
      }
      setUserRating(0);
      setUserReview('');
    } catch (error) {
      console.error('Error submitting review:', error);
    }finally {
      setLoading(false); 
    }
  };


  const handleOpenModal = (movie: Movie) => {
    setSelectedMovie(movie);
    fetchReviews(movie.id); 
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedMovie(null);
    setReviews([]);
    setUserRating(0);
    setUserReview('');
  };

  const handleGenreChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setSelectedGenre(event.target.value);
  };

  const handleRatingChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setSelectedRating(event.target.value);

  };

  const handleYearChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setSelectedYear(event.target.value);

  };

  const handleRequestSort = (property:any) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);

  };

  const resetFilters = () => {
    setSelectedGenre('');
    setSelectedRating('');
    setSelectedYear('');
    setOrder(null);
    setOrderBy(null);
    setPage(0);
  }

  const formatDate = (date: any) => {
    const parsedDate = new Date(date); // Convierte a objeto Date
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date"); // Lanza un error si la fecha es inválida
    }
    return parsedDate.getFullYear(); // Devuelve solo el año
  };
  
  

  useEffect(() => {
    fetchMovies();
  }, [selectedGenre, selectedRating, selectedYear, order, orderBy, page]);

  useEffect(() => {
    fetchGenres();
  }, []);

  return (
    <div style={{ paddingLeft: "25vh", paddingRight: "25vh", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <Typography variant="h3" component="h1" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 4 }}>
        Movie List
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: "200px" }}>
          <InputLabel id="genre-select-label">Select Genre</InputLabel>
          <Select
            labelId="genre-select-label"
            id="genre-select"
            value={selectedGenre}
            label="Select Genre"
            onChange={handleGenreChange}
          >
            <MenuItem value="">All</MenuItem>
            {genres.map((genre) => (
              <MenuItem key={genre.id} value={genre.id}>
                {genre.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: "200px" }}>
          <InputLabel id="rating-select-label">Select Rating</InputLabel>
          <Select
            labelId="rating-select-label"
            id="rating-select"
            value={selectedRating}
            label="Select Rating"
            onChange={handleRatingChange}
          >
            <MenuItem value="">All</MenuItem>
            {[...Array(10).keys()].map((rating) => (
              <MenuItem key={rating + 1} value={rating + 1}>
                {rating + 1 === 10 ? rating + 1 : `>${rating + 1}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: "200px" }}>
          <InputLabel id="year-select-label">Select Year</InputLabel>
          <Select
            labelId="year-select-label"
            id="year-select"
            value={selectedYear}
            label="Select Year"
            onChange={handleYearChange}
          >
            <MenuItem value="">All</MenuItem>
            {Array.from({ length: 30 }, (_, index) => 2023 - index).map(
              (year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={resetFilters}
          sx={{ boxShadow: 3, textTransform: 'none' }}
        >
          Reset Filters
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 4 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#3f51b5' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Poster</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} onClick={() => handleRequestSort("title")}>Title {orderBy === "title" ? (order === "asc" ? "▲" : "▼") : ""}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} onClick={() => handleRequestSort("vote_average")}>Rating {orderBy === "vote_average" ? (order === "asc" ? "▲" : "▼") : ""}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movies.map((movie) => (
              <TableRow key={movie.id}>
                <TableCell>
                  <img
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                    alt={movie.title}
                    style={{ borderRadius: "10px" }}
                  />
                </TableCell>
                <TableCell>{movie.title}{"-"+formatDate(movie.release_date)}</TableCell>
                <TableCell>{movie.overview}</TableCell>
                <TableCell>{movie.vote_average}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenModal(movie)}
                    sx={{ boxShadow: 2, textTransform: 'none' }}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={moviesResponse.total_results}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) =>
            setRowsPerPage(parseInt(event.target.value, 10))
          }
        />
      </TableContainer>

      {/* Movie Details Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box sx={{ ...style, width: 700, height: "80vh", overflowY: "auto", boxShadow: 5 }}>
          {selectedMovie && (
            <>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                {selectedMovie.title}
              </Typography>
              <Box sx={{ textAlign: 'center' }}>
                <img
                  src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
                  alt={selectedMovie.title}
                  style={{ width: "70%", height: "auto", borderRadius: '10px' }}
                />
              </Box>
              <Typography sx={{ mt: 2 }}>
                Release Date: {new Date(selectedMovie.release_date).toLocaleDateString()}
              </Typography>
              <Typography sx={{ mt: 2 }}>
                Rating: {selectedMovie.vote_average}
              </Typography>
              <Typography sx={{ mt: 2 }}>
                Overview: {selectedMovie.overview}
              </Typography>

              {/* Reviews Section */}
              <Typography variant="h6" component="h3" sx={{ mt: 4, fontWeight: 'bold' }}>
                Reviews
              </Typography>
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <Box
                    key={index}
                    sx={{
                      mt: 2,
                      border: "1px solid #ccc",
                      padding: "10px",
                      borderRadius: "5px",
                      boxShadow: 1,
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Rating: {review.user_rating}/5
                    </Typography>
                    <Typography variant="body2">{review.review}</Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ mt: 1 }}
                    >
                      {new Date(review.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography>No reviews available for this movie.</Typography>
              )}

              {/* Add Review Section */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" component="h4" sx={{ fontWeight: 'bold' }}>
                  Leave a Review
                </Typography>
                <Rating
                  value={userRating}
                  onChange={(_, newValue) => setUserRating(newValue)}
                  precision={0.5}
                  max={5}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Review"
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  sx={{ mt: 2 }}
                />
                <Button
                  variant="contained"
                  color="success"
                  onClick={submitReview}
                  sx={{ mt: 2, boxShadow: 3, textTransform: 'none' }}
                >
                  Submit Review
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      <Modal
        open={loading}
        aria-labelledby="loading-modal-title"
        aria-describedby="loading-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </Modal>
    </div>
  );
 
};
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
  borderRadius: "10px",
};
export default App;