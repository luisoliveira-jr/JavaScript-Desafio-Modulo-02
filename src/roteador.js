const express = require('express');
const { validarCampos, validaSenha, verificaCpfOuEmail, verificaConta, verificaSaldo, verificaContaValor, verificaSenhaUsuario, verificaSaldoTransacoes, validarCamposTransferencia, validarCamposConta } = require('./intermediarios');
const { listarContas, criarConta, atualizarUsuario, excluirConta, depositar, sacar, transferir, saldo, extrato } = require('./controladores/banco');

const rotas = express.Router();

//Listar contas bancárias
//GET /contas?senha_banco=Cubos123Bank
//Verificar se a senha do banco foi informada (passado como query params na url)
//Validar se a senha do banco está correta
rotas.get('/contas', validaSenha, listarContas);

//Criar conta bancária
//POST /contas
//CPF deve ser um campo único.
//E-mail deve ser um campo único.
//Verificar se todos os campos foram informados (todos são obrigatórios)
rotas.post('/contas', validarCampos, verificaCpfOuEmail, criarConta);

//Atualizar usuário da conta bancária
//PUT /contas/:numeroConta/usuario
//Verificar se foi passado todos os campos no body da requisição
//Verificar se o numero da conta passado como parametro na URL é válida
//Se o CPF for informado, verificar se já existe outro registro com o mesmo CPF
//Se o E-mail for informado, verificar se já existe outro registro com o mesmo E-mail
rotas.put('/contas/:numeroConta/usuario', validarCampos, verificaConta, verificaCpfOuEmail, atualizarUsuario);

//Excluir Conta
//DELETE /contas/:numeroConta
//Verificar se o numero da conta passado como parametro na URL é válida
//Permitir excluir uma conta bancária apenas se o saldo for 0 (zero)
rotas.delete('/contas/:numeroConta', verificaConta, verificaSaldo, excluirConta);

//Depositar
//POST /transacoes/depositar
//Verificar se o numero da conta e o valor do deposito foram informados no body
//Verificar se a conta bancária informada existe
rotas.post('/transacoes/depositar', verificaContaValor, depositar);

//Sacar
//POST /transacoes/sacar
//Verificar se o numero da conta, o valor do saque e a senha foram informados no body
//Verificar se a conta bancária informada existe
//Verificar se a senha informada é uma senha válida para a conta informada
//Verificar se há saldo disponível para saque
rotas.post('/transacoes/sacar', verificaContaValor, verificaSenhaUsuario, verificaSaldoTransacoes, sacar);

//Transferir
//POST /transacoes/transferir
//Verificar se o número da conta de origem, de destino, senha da conta de origem e valor da transferência foram informados no body
//Verificar se a conta bancária de origem informada existe
//Verificar se a conta bancária de destino informada existe
//Verificar se a senha informada é uma senha válida para a conta de origem informada
//Verificar se há saldo disponível na conta de origem para a transferência
rotas.post('/transacoes/transferir', validarCamposTransferencia, transferir);

//Saldo
//GET /contas/saldo?numero_conta=123&senha=123
//Verificar se o numero da conta e a senha foram informadas (passado como query params na url)
//Verificar se a conta bancária informada existe
//Verificar se a senha informada é uma senha válida
rotas.get('/contas/saldo', validarCamposConta, saldo);

//Saldo
//GET /contas/extrato?numero_conta=123&senha=123
//Verificar se o numero da conta e a senha foram informadas (passado como query params na url)
//Verificar se a conta bancária informada existe
//Verificar se a senha informada é uma senha válida
rotas.get('/contas/extrato', validarCamposConta, extrato);

module.exports = rotas;
