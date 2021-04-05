const express = require('express');
const { isWithinInterval, parse, parseISO, endOfDay } = require('date-fns');
const { v4: uuidv4 } = require('uuid');

const app = express();
const customers = [];

app.use(express.json());


function verifyExistingAccount(req, res, next) {
  const { cpf } = req.params;

  const customer = customers.find(el => el.cpf === cpf);

  if (!customer) {
    return res.status(404).json({ message: 'customer not found' });
  }


  req.customer = customer;

  return next();
}

function getBalance(statement) {
  return statement.reduce((acc, cur) => {
    return cur.type === 'credit' ? acc + cur.amount : acc - cur.amount;
  }, 0);
}

app.post('/account', (req, res) => {
  const { cpf, name } = req.body;

  if (customers.some(el => el.cpf === cpf)) {
    return res.status(400).json({ error: 'customer already exists'});
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });

  return res.status(201).json({ message: 'ok' });
});

app.get('/statement/:cpf', verifyExistingAccount, (req, res) => {
  const { beginDate, endDate } = req.query;

  let statement = req.customer.statement;

  if (beginDate && endDate) {
    const start = parse(beginDate, 'dd-MM-yyyy', new Date());
    const end = endOfDay(parse(endDate, 'dd-MM-yyyy', new Date()));
    statement = statement.filter(datum => {
      return isWithinInterval(datum.created_at, { start, end })
    });
  }

  return res.status(200).json({ statement });
})

app.post('/deposit/:cpf', verifyExistingAccount, (req, res) => {
  const { description, amount } = req.body;

  const { customer } = req;

  const operation = {
    amount,
    description,
    created_at: new Date(),
    type: 'credit'
  };

  customer.statement.push(operation);

  return res.status(201).json({ message: 'ok' });
});

app.post('/withdraw/:cpf', verifyExistingAccount, (req, res) => {
  const { amount } = req.body;
  const { customer }  = req;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return res.status(400).json({ message: 'Insufficient funds' });
  }

  const operation = {
    amount,
    description: 'Online withdraw',
    created_at: new Date(),
    type: 'debit'
  };

  customer.statement.push(operation);

  return res.status(201).json({ message: 'OK' });
});

app.put('/account/:cpf', verifyExistingAccount, (req, res) => {
  const { name } = req.body;
  const { customer } = req;

  customer.name = name;

  return res.status(200).json({ data: customer });
});

app.get('/account/:cpf', verifyExistingAccount, (req, res) => {
  const { customer } = req;

  return res.status(200).json({ data: customer });
});

app.get('/account', (req, res) => {
  return res.status(200).json({ data: customers });
});

app.delete('/account/:cpf', verifyExistingAccount, (req, res) => {
  const { cpf } = req.params; 

  customers.splice(customers.findIndex(el => el.cpf === cpf), 1);

  return res.status(200).json({ data: customers });
});

app.listen(3333);