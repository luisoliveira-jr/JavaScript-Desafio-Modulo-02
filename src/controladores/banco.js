const { contas, saques, depositos, transferencias } = require('../bancodedados/bancodedados');
const { relatorioDaConta } = require('../bancodedados/extrato');
const { format } = require('date-fns');

//Criar uma nova conta cujo número é único
let idNovaConta = 1;

//Listar contas bancárias
const listarContas = (req, res) => {
    // contas encontradas
    return res.json(contas);
};

//Criar conta bancária
const criarConta = async (req, res) => {
    //Atribui valores enviados pelo body, ao objeto
    const novaConta = {
        //Criar uma nova conta cujo número é único
        numero: idNovaConta,
        //Definir o saldo inicial da conta como 0
        saldo: 0,
        usuario: { ...req.body }
    };

    contas.push(novaConta);

    //Criar uma nova conta cujo número é único
    idNovaConta++;

    //Em caso de sucesso, não deveremos enviar conteúdo no corpo (body) da resposta.
    res.status(201).send();
};

//Atualizar usuário da conta bancária
const atualizarUsuario = async (req, res) => {
    const { numeroConta } = req.params;

    const conta = contas.find(conta => {
        return conta.numero == numeroConta;
    });

    conta.usuario = { ...req.body };

    //Em caso de sucesso, não deveremos enviar conteúdo no corpo (body) da resposta.
    res.status(204).send();
};

//Excluir Conta
const excluirConta = async (req, res) => {
    const { numeroConta } = req.params;

    //Remover a conta do objeto de persistência de dados
    const indexExcluirConta = contas.findIndex((conta) => {
        return conta.numero == numeroConta;
    });

    contas.splice(indexExcluirConta, 1);

    //Em caso de sucesso, não deveremos enviar conteúdo no corpo (body) da resposta.
    res.status(204).send();
};

//Depositar
const depositar = async (req, res) => {
    const { numero_conta, valor } = req.body;

    //Somar o valor de depósito ao saldo da conta encontrada
    const conta = contas.find(conta => {
        return conta.numero == numero_conta;
    });

    if (conta) {
        conta.saldo = conta.saldo + valor;

        //"2021-08-10 23:40:35"    
        const dataRegistroDeposito = format(new Date(), "yyyy-dd-MM kk:mm:ss")

        const novoDeposito = {
            data: dataRegistroDeposito,
            numero_conta,
            valor
        };

        depositos.push(novoDeposito);
    };

    //Em caso de sucesso, não deveremos enviar conteúdo no corpo (body) da resposta.
    res.status(201).send();
};

//Sacar
const sacar = async (req, res) => {
    const { numero_conta, valor } = req.body;

    //Subtrair o valor sacado do saldo da conta encontrada
    const conta = contas.find(conta => {
        return conta.numero == numero_conta;
    });

    if (conta) {
        conta.saldo = conta.saldo - valor;

        //"2021-08-10 23:40:35"    
        const dataRegistroSaque = format(new Date(), "yyyy-dd-MM kk:mm:ss")

        const novoSaque = {
            data: dataRegistroSaque,
            numero_conta,
            valor
        };

        saques.push(novoSaque);
    };

    res.status(201).send();
};

//Transferir
const transferir = async (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor } = req.body;

    //Subtrair o valor da transfência do saldo na conta de origem
    const contaOrigem = contas.find(conta => {
        return conta.numero == numero_conta_origem;
    });

    if (contaOrigem) {
        contaOrigem.saldo = contaOrigem.saldo - valor;
    };

    //Somar o valor da transferência no saldo da conta de destino
    const contaDestino = contas.find(conta => {
        return conta.numero == numero_conta_destino;
    });

    if (contaDestino) {
        contaDestino.saldo = contaDestino.saldo + valor;
    };

    //"2021-08-10 23:40:35"    
    const dataRegistroSaque = format(new Date(), "yyyy-dd-MM kk:mm:ss")

    const novaTransferencia = {
        data: dataRegistroSaque,
        numero_conta_origem,
        numero_conta_destino,
        valor
    };

    transferencias.push(novaTransferencia);

    res.status(201).send();
};

//Saldo
const saldo = async (req, res) => {
    const { numero_conta } = req.query;

    contas.find(conta => {
        if (conta.numero == numero_conta) {
            return res.json(`saldo: ${conta.saldo}`);
        };
    });
};

//Extrato
//Retornar a lista de transferências, depósitos e saques da conta em questão
const extrato = async (req, res) => {
    const { numero_conta } = req.query;

    const depositosEncontrados = depositos.filter((deposito) => {
        return deposito.numero_conta === numero_conta;
    });
    relatorioDaConta.depositosEfetuados.push(depositosEncontrados)

    const saquesEncontrados = saques.filter((saque) => {
        return saque.numero_conta === numero_conta;
    });
    relatorioDaConta.saquesEfetuados.push(saquesEncontrados);

    const transferenciasEnviadasEncontradas = transferencias.filter((transferencia) => {
        return transferencia.numero_conta_origem === numero_conta;
    });
    relatorioDaConta.transferenciasEnviadas.push(transferenciasEnviadasEncontradas);

    const transferenciasRecebidasEncontradas = transferencias.filter((transferencia) => {
        return transferencia.numero_conta_destino === numero_conta;
    });
    relatorioDaConta.transferenciasRecebidas.push(transferenciasRecebidasEncontradas);

    return res.status(200).json(relatorioDaConta);
};

module.exports = {
    listarContas,
    criarConta,
    atualizarUsuario,
    excluirConta,
    depositar,
    sacar,
    transferir,
    saldo,
    extrato
};