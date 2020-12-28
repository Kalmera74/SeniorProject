import React from 'react';
import { Button } from 'antd';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button style={{ margin: 10, marginTop: -10 }} type="primary" htmlType="submit" onClick={handleClickOpen}>
        Add User
      </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Add a user</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To invite a user to this system, please enter email address here.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="E-mail Address"
            type="email"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Add
          </Button>
          <Button onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}