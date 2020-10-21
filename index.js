/*

index.js - driver
Copyright (C) 2020  William R. Moore <caranmegil@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

const Koa = require('koa');
const app = new Koa();
const router = new require('koa-router')();
require('koa-validate')(app)

function rollDie(sides) {
  let result = Math.floor(Math.random() * Math.floor(sides)) + 1;
  return result;
}

var playerChance = {}

const NICK=0
const OUT=1

function hazard(main) {
  let result = { result: -1, log: `playing with a main of ${main}\n` }
  let die1 = rollDie(6);
  let die2 = rollDie(6);
  result.log += `die 1: ${die1}, die 2: ${die2}\n`
  if (die1 + die2 == main) {
    result.result = NICK;
    return result
  }
  switch (die1 + die2) {
    case 2:
    case 3:
	result.result = OUT;
    case 11:
    case 12:
      if (main == 5 || main == 9) result.result = OUT;
      if ( (main == 6 || main == 8) && die1 + die2 == 11) result.result = OUT;
      if ( (main == 6 || main == 8) && die1 + die2 == 12) result.result = NICK;
      if (main == 7 && die1 + die2 == 11) result.result = NICK;
      if (main == 7 && die1 + die2 == 12) result.result = OUT;
    default:
      roll_chance(main, die1+die2, result)
  }
  return result
}

function roll_chance(main, chance, result) {
  let die1 = rollDie(6);
  let die2 = rollDie(6);

  result.log += `chance roll (${chance}) - die 1: ${die1}, die 2: ${die2}\n`;

  if (die1 + die2 == chance) result.result = NICK;
  if (die1 + die2 == main) result.result = OUT;

  if (result.result == -1) {
    roll_chance(main, chance, result);
  }
}

router.get('/:main', async (ctx) => {
  this.checkParams('main').empty().gt(9, 'too high').lt(5, 'too low').toInt();
  if (this.errors) {
    this.body = this.errors;
  }

  this.body = hazard(ctx.params.main)
});

app.use(router.middleware())
app.use(router.allowedMethods())

let port = process.env.PORT || 3020;

app.listen(port, () => {
  console.log(`Node server listening at http://localhost:${port}`)
});
