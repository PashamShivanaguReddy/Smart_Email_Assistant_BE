import { useState, useEffect } from 'react';
import './App.css';
//import { Container } from '@mui/material';
import { Typography, CircularProgress, Container,
          FormControl, InputLabel,TextField, Select, MenuItem, Button, Box, Switch } from '@mui/material';
//import { TextField, Select, MenuItem, Button, Box } from '@mui/material';
import axios from 'axios';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Load saved replies from local storage
  useEffect(() => {
    const savedReply = localStorage.getItem('generatedReply');
    if (savedReply) setGeneratedReply(savedReply);
  }, []);

  useEffect(() => {
    if (generatedReply) {
      localStorage.setItem('generatedReply', generatedReply);
    }
  }, [generatedReply]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8085/api/generate', {
        emailContent,
        tone,
      });
      setGeneratedReply(
        typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
      );
    } catch (error) {
      if (error.response) {
        setError(`Server error: ${error.response.data.message}`);
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('Unexpected error occurred. Please try again.');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, bgcolor: darkMode ? '#121212' : '#ffffff', color: darkMode ? '#fff' : '#000' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#007BFF' }}>
          Email Reply Generator
        </Typography>
        <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
      </Box>

      <Box sx={{ mx: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          label="Original Email Content"
          value={emailContent || ''}
          onChange={(e) => setEmailContent(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tone (Optional)</InputLabel>
          <Select value={tone || ''} label="Tone (Optional)" onChange={(e) => setTone(e.target.value)}>
            <MenuItem value="">None</MenuItem>
            <MenuItem value="professional">Professional</MenuItem>
            <MenuItem value="casual">Casual</MenuItem>
            <MenuItem value="friendly">Friendly</MenuItem>
            <MenuItem value="formal">Formal</MenuItem>
            <MenuItem value="polite">Polite</MenuItem>
           
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!emailContent || loading}
          fullWidth
          sx={{
            background: 'linear-gradient(90deg, #007BFF, #0056b3)',
            color: 'white',
            fontSize: '1.1rem',
            py: 1.5,
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': { background: 'linear-gradient(90deg, #0056b3, #0046a3)' },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Reply'}
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {generatedReply && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Generated Reply:
          </Typography>
          <TextField fullWidth multiline rows={6} variant="outlined" value={generatedReply || ''} inputProps={{ readOnly: true }} />

          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => navigator.clipboard.writeText(generatedReply)}
          >
            Copy to Clipboard
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default App;