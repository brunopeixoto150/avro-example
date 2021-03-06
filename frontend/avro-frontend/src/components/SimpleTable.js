import React, { useState, useEffect } from 'react';
import axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Modal from '@material-ui/core/Modal';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import { peopleType } from '../util/constants'
import AddForm from './AddForm';
import ProtobufManager from '../proto/people';

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
  },
  paper: {
    position: 'absolute',
    width: 500,
    height: 500,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

export default function SimpleTable() {
    const classes = useStyles();

    const [modalStyle] = useState(getModalStyle);
    const [rows, setRows] = useState([]);
    const [checked, setChecked] = useState('json');
    const [openModal, setOpenModal] = useState(false);

    const handleChange = (event) => {
      setChecked(event.target.value);
    };

    const handleModal = (value) => {
      setOpenModal(value);
    };

    useEffect(() => {
        (async () => {
          switch (checked) {
            case 'avro':
              const resultAvro = await axios("http://localhost:5000/avro");
              var buffer = Buffer.from(resultAvro.data, 'binary');
              var data = peopleType.fromBuffer(buffer);
              setRows(data);
              break;
            case 'json':
              var resultJson = await axios("http://localhost:5000/json");
              setRows(resultJson.data);
              break;
            case 'protobuf':
              const resultProtobuf = await axios("http://localhost:5000/protobuf");
              const client = ProtobufManager.getInstance();
              var dataProtobuf = client.decodePeople(Buffer.from(resultProtobuf.data, 'binary'));
              setRows(dataProtobuf.people);
              break;
            default:
              const result = await axios("http://localhost:5000/json");
              setRows(result.data);
              break;
          }
        })();
      }, [checked, openModal]);

    return (
       <Card>
         <CardContent>
            <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
                <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell >E-mail</TableCell>
                    <TableCell >Phone</TableCell>
                    <TableCell >Age</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.name}>
                    <TableCell>
                        {row.name}
                    </TableCell>
                    <TableCell >{row.email}</TableCell>
                    <TableCell >{row.phone}</TableCell>
                    <TableCell >{row.age}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </TableContainer>
          </CardContent>
          <CardActions>
            <Fab color="primary" aria-label="add"
              onClick={() => {
                handleModal(true);
              }}>
              <AddIcon />
            </Fab>
            <Grid component="label" container alignItems="center" spacing={1}>
              <FormControl component="fieldset">
                <RadioGroup row aria-label="position" name="position" defaultValue="json" value={checked} onChange={handleChange}>
                  <FormControlLabel
                    value="json"
                    control={<Radio color="primary" />}
                    label="JSON"
                    labelPlacement="start"
                  />
                  <FormControlLabel
                    value="protobuf"
                    control={<Radio color="primary" />}
                    label="Protobuf"
                    labelPlacement="start"
                  />
                  <FormControlLabel
                    value="avro"
                    control={<Radio color="primary" />}
                    label="Avro"
                    labelPlacement="start"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Modal
              open={openModal}
              onClose={() => {
                handleModal(false);
              }}
              aria-labelledby="Add person">
                <div style={modalStyle} className={classes.paper}>
                  <AddForm closeModal={() => {
                    handleModal(false);
                  }}/>
                </div>
            </Modal>
          </CardActions>
        </Card>
    );
}
