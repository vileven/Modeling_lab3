/**
 *  Лабораторная работа №3
 *  Володин Сергей
 *  Функциональное моделирование
 */

import * as readLine from 'readline-sync';

declare type InputNodeName = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' ;
declare type NodeName = InputNodeName | 'g' | 'h' | 'i' | 'j' | 'i' | 'k' | 'l';

// константы
const INPUTS:NodeName[]   = ['a', 'b', 'c', 'd', 'e', 'f'];
const VALS: NodeName[]    = [...INPUTS, 'g', 'h', 'j', 'i', 'k', 'l'];
const AND:  number[][]  = [[0, 0, 0, 0, 0], [0, 1, 2, 3, 4], [0, 2, 2, 2, 2], [0, 3, 2, 3, 2], [0, 4, 2, 2, 4]];
const OR:   number[][]  = [[0, 1, 2, 3, 4], [1, 1, 1, 1, 1], [2, 1, 2, 2, 2], [3, 1, 2, 3, 2], [4, 1, 2, 2, 4]];
const NOT:  number[]    = [1, 0, 2, 4, 3];


const and: (...inputs) => number =
	(...inputs) => {
		if (inputs.some(x => x === void 0)) return void 0;
		return inputs.slice(1).reduce(((prev, cur) => AND[prev][cur]), inputs[0]);
	};

const notAnd: (...inputs) => number =
	(...inputs) => NOT[and(...inputs)];

const or: (...inputs) => number =
	(...inputs) => {
		if (inputs.some(x => x === void 0)) return void 0;
		return inputs.slice(1).reduce(((prev, cur) => OR[prev][cur]), inputs[0]);
	};

const notOr: (...inputs) => number =
	(...inputs) => NOT[or(...inputs)];

const SCHEME: {name: string, inputs: NodeName[], fun: Function}[] = [
	{
		name: 'g',
		inputs: ['a', 'b'],
		fun: and,
	},
	{
		name: 'h',
		inputs: ['c', 'd', 'g'],
		fun: notOr,
	},
	{
		name: 'i',
		inputs: ['e', 'f'],
		fun: or,
	},
	{
		name: 'j',
		inputs: ['g', 'h'],
		fun: notOr,
	},
	{
		name: 'k',
		inputs: ['j', 'i'],
		fun: notAnd,
	},
	{
		name: 'l',
		inputs: ['j', 'k'],
		fun: and
	},
];

const TRANSITIONS : number[][] = [[0, 4], [3, 1]];


/**
 * Распарсить числа из вводной строки
 * @param {string} gotString строка
 * @param {number} dimension число необходимых чисел
 * @returns {number[]} выходной массив
 */
const parseNumbers: (gotString: string, dimension: number) => number[] =
	(gotString, dimension) => gotString.trim().split(/[\s,]+/, dimension).map(str => Number(str));

/**
 * Проверить, что все цифры равны 0 или 1
 * @param {number[]} line массив чисел строки
 * @returns {boolean} результат проверки
 */
const isLineRight: (line: number[]) => boolean =
	line => line.every(d => d === 0 || d === 1);

/**
 * Возвращает массив от 1 до N включительно
 * @param {number} N крайний правый интервал
 * @returns {number[]}
 */
const getArrayFrom1ToN: (N: number) => number[] =
	N => Array.from(new Array(N),(_, index: number) => index + 1);

/**
 * zip функция (Как в python)
 * @param rows массивы по которым необходимо проитерироваться
 * @returns {any[][]} результат
 */
const zip: (...rows) => any[][] =
	(...rows) => [...rows[0]].map((_, c) => rows.map(row => row[c]));

/**
 * Получить новый вектор входных данных на основе двух переданных и матрицы переходов
 * @param {number[]} origin начальный вектор
 * @param {number[]} final конечный
 * @param {number[]} transitions матрица переходов
 * @returns {number[]} результат
 */
const transform: (origin: number[], final: number[], transitions: number[][]) => number[] =
	(origin, final, transitions) => zip(origin, final).map(([o, f]) => transitions[o][f]);

/**
 * Расчёт схемы
 * @param {NodeName[]} vals имена узлов
 * @param {{name: string; inputs: NodeName[]; fun: Function}[]} scheme конфигурация схемы
 * @param {number[]} inputs входные данные
 * @param {NodeName} lastNode имя результата
 * @returns {{[name: string]: number} результат
 */
const calculateScheme: (vals: NodeName[],
                        scheme: {name: string, inputs: NodeName[], fun: Function}[],
                        inputs: number[],
                        lastNode: NodeName) => {[name: string]: number} =
	(vals, scheme, inputs, lastNode) => {
		const result: {[name: string]: number} = {};
		 vals.forEach((name, index) => result[name] = inputs[index] );

		while(result[lastNode] === void 0) {
			scheme.forEach((node: {name: string, inputs: NodeName[], fun: Function}) => {
				if (result[node.name] === void 0) {
					result[node.name] = node.fun(...node.inputs.map(input => result[input]));
				}
			})
		}

		return Object.keys(result)
			.sort((a, b) => a.localeCompare(b))
			.slice(inputs.length)
			.reduce((obj, key) => {
				obj[key] = result[key];
				return obj;
			}, {});
	};



const out:  number[][]  = [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];

//Ввод состояний

console.log('Введите начальные состояния: ');
let inputString: string   = readLine.question('a  b  c  d  e  f \n');
const initialVector: number[] = parseNumbers(inputString, INPUTS.length);

console.log('Введите конечные состояния: ');
inputString = readLine.question('a  b  c  d  e  f \n');
const finalVector: number[] = parseNumbers(inputString, INPUTS.length);

if (!isLineRight([...initialVector, ...finalVector])) {
	console.log('Состояния принадлежат множеству [0, 1]');
	process.exit(0);
}


// Получение результата на входных данных
const inputResult: number[] = transform(initialVector, finalVector, TRANSITIONS);

//  Вывод
console.log('Таблица переходов для входных данных: ');

let outString: string = zip(INPUTS, initialVector, inputResult, finalVector)
	.map(([inputValue, initV, res, finalV]) => `${inputValue}  |  ${initV}  ${res}  ${finalV}`)
	.join('\n');

console.log(outString);

//Расчет выходных данных
const initialValues: {[name: string]: number} = calculateScheme(VALS, SCHEME, initialVector, 'l');

const finalValues: {[name: string]: number} = calculateScheme(VALS, SCHEME, finalVector, 'l');

const resultValues: {[name: string]: number} = calculateScheme(VALS, SCHEME, inputResult, 'l');

console.log('Таблица переходов выходных данных: ');

outString = VALS
	.slice(INPUTS.length)
	.map(nodeName =>
		`${nodeName}  |  ${initialValues[nodeName]}  ${resultValues[nodeName]}  ${finalValues[nodeName]} ` +
		`${resultValues[nodeName] === 2 ? (initialValues[nodeName] === finalValues[nodeName] ? '- Статическая ошибка' :
			'- Динамическая ошибка') : ('')}` )
	.join('\n');

console.log(outString);
