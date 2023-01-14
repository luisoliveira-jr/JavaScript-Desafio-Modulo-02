const { contas } = require('./bancodedados/bancodedados');

//Validar se a senha do banco está correta
const validaSenha = (req, res, next) => {
    //Verificar se a senha do banco foi informada (passado como query params na url)
    const { senha_banco } = req.query;

    if (senha_banco !== 'Cubos123Bank') {
        return res.status(401).json({ mensagem: 'A senha do banco informada é inválida!' });
    };

    next();
};

//Verificar se todos os campos foram informados (todos são obrigatórios)
const validarCampos = (req, res, next) => {
    //Requisição - O corpo (body) deverá possuir um objeto com as seguintes propriedades (respeitando estes nomes):
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome) {
        return res.status(400).json({ mensagem: 'O nome deve ser informado.' });
    };

    if (!cpf) {
        return res.status(400).json({ mensagem: 'O CPF deve ser informado.' });
    };

    if (!data_nascimento) {
        return res.status(400).json({ mensagem: 'A data de nascimento deve ser informada.' });
    };

    if (!telefone) {
        return res.status(400).json({ mensagem: 'O nome telefone ser informado.' });
    };

    if (!email) {
        return res.status(400).json({ mensagem: 'O email deve ser informado.' });
    };

    if (!senha) {
        return res.status(400).json({ mensagem: 'A senha deve ser informado.' });
    };

    next();
};

//Se o CPF for informado, verificar se já existe outro registro com o mesmo CPF
//Se o E-mail for informado, verificar se já existe outro registro com o mesmo E-mail
const verificaCpfOuEmail = (req, res, next) => {
    //CPF deve ser um campo único.
    //E-mail deve ser um campo único.
    const { cpf, email } = req.body;

    const cpfOuEmailExiste = contas.find(conta => {
        return conta.usuario.cpf === cpf || conta.usuario.email === email;
    });

    if (cpfOuEmailExiste) {
        return res.status(400).json({ mensagem: 'Já existe uma conta com o cpf ou e-mail informado!.' });
    };

    next();
};

//Verificar se a conta bancária informada existe
const verificaConta = (req, res, next) => {
    const { numeroConta } = req.params;

    //Verificar se o numero da conta passado como parametro na URL é válida
    const numeroContaExiste = contas.find(conta => {
        return conta.numero == numeroConta;
    });

    if (!numeroContaExiste) {
        return res.status(400).json({ mensagem: 'O número da conta não encontrado!' });
    };

    next();
};

//Permitir excluir uma conta bancária apenas se o saldo for 0 (zero)
const verificaSaldo = (req, res, next) => {
    const { numeroConta } = req.params;

    const conta = contas.find(conta => {
        return conta.numero == numeroConta;
    });

    if (conta.saldo != 0) {
        return res.status(400).json({ mensagem: 'A conta só pode ser removida se o saldo for zero!' });
    };

    next();
};

//Verificar se o numero da conta e o valor do deposito foram informados no body
const verificaContaValor = (req, res, next) => {
    const { numero_conta, valor } = req.body;

    if (!numero_conta || !valor) {
        return res.status(400).json({ mensagem: "O número da conta e o valor são obrigatórios!" });
    };

    //Verificar se a conta bancária informada existe
    const numeroContaExiste = contas.find(conta => {
        return conta.numero == numero_conta;
    });

    if (!numeroContaExiste) {
        return res.status(400).json({ mensagem: 'O número da conta não encontrado!' });
    };

    //Não permitir depósitos com valores negativos ou zerados
    if (valor <= 0) {
        return res.status(400).json({ mensagem: 'O valor deve ser maior que 0 (zero).' });
    };

    next();
};

//Verifica senha
const verificaSenhaUsuario = (req, res, next) => {
    const { senha } = req.body;

    //Verificar se a senha foi informada no body
    if (!senha) {
        return res.status(400).json({ mensagem: "A senha é obrigatória!" });
    };

    //Verificar se a conta bancária informada existe
    const validaSenhaUsuario = contas.find(conta => {
        return conta.usuario.senha === senha;
    });

    //Verificar se a senha informada é uma senha válida para a conta informada
    if (!validaSenhaUsuario) {
        return res.status(401).json({ mensagem: 'A senha informada é inválida!' });
    };

    next();
};

//Verificar se há saldo disponível para saque
//Verificar se há saldo disponível na conta de origem para a transferência
const verificaSaldoTransacoes = (req, res, next) => {
    const { numero_conta, valor } = req.body;

    const conta = contas.find(conta => {
        return conta.numero == numero_conta;
    });

    if (!valor) {
        return res.status(400).json({ mensagem: "Insira o valor da transação!" });
    };

    if (conta.saldo < valor) {
        return res.status(400).json({ mensagem: 'Seu saldo não é suficiente.' });
    };

    next();
};

const validarCamposTransferencia = (req, res, next) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;
    //Verificar se o número da conta de origem, de destino, senha da conta de origem e valor da transferência foram informados no body

    if (!numero_conta_origem) {
        return res.status(400).json({ mensagem: "O número da conta origem é obrigatório!" });
    };

    if (!numero_conta_destino) {
        return res.status(400).json({ mensagem: "O número da conta destino é obrigatório!" });
    };

    if (!valor) {
        return res.status(400).json({ mensagem: "O valor é obrigatório!" });
    };

    if (!senha) {
        return res.status(400).json({ mensagem: "A senha é obrigatória!" });
    };

    //Verificar se a conta bancária de origem informada existe
    const contaOrigem = contas.find(conta => {
        return conta.numero == numero_conta_origem;
    });

    if (!contaOrigem) {
        return res.status(400).json({ mensagem: 'Conta origem não encontrada!' });
    };

    //Verificar se a conta bancária de destino informada existe
    const contaDestino = contas.find(conta => {
        return conta.numero == numero_conta_destino;
    });

    if (!contaDestino) {
        return res.status(400).json({ mensagem: 'Conta destino não encontrada!' });
    };

    //Verificar se a senha informada é uma senha válida para a conta de origem informada
    if (contaOrigem.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'A senha informada é inválida!' });
    };

    //Verificar se há saldo disponível na conta de origem para a transferência
    if (contaOrigem.saldo < valor) {
        return res.status(400).json({ mensagem: 'Saldo insuficiente!' });
    };

    next();
};

const validarCamposConta = (req, res, next) => {
    const { numero_conta, senha } = req.query;

    //Verificar se o numero da conta e a senha foram informadas (passado como query params na url)
    if (!numero_conta) {
        return res.status(400).json({ mensagem: "O número da conta é obrigatório!" });
    };

    if (!senha) {
        return res.status(400).json({ mensagem: "A senha é obrigatório!" });
    };

    const conta = contas.find(conta => {
        return conta.numero == numero_conta;
    });

    //Verificar se a conta bancária informada existe
    if (!conta) {
        return res.status(400).json({ mensagem: 'Conta não encontrada!' });
    };

    //Verificar se a senha informada é uma senha válida
    if (conta.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'A senha informada é inválida!' });
    };

    next();

};

module.exports = {
    validaSenha,
    validarCampos,
    verificaCpfOuEmail,
    verificaConta,
    verificaSaldo,
    verificaContaValor,
    verificaSenhaUsuario,
    verificaSaldoTransacoes,
    validarCamposTransferencia,
    validarCamposConta
};