import React, { useState } from 'react'
import { Sequence } from './Sequence'
import { Box } from '@mui/material'
import { RunnerConfig } from './RunnerConfig'


export const RunnerTab = (props) => {

   const {requests, setRequests } = props
  
 
  return (
    <Box
      sx={{
        height: 'calc(100% - 70px)', 
        display: 'flex',
        overflow: 'hidden',      
      }}
    >
      
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Sequence requests={requests} setRequests={setRequests} />
      </Box>

      {/* Right panel */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <RunnerConfig
          requests={requests}
         
        />
      </Box>
    </Box>
  )
}
