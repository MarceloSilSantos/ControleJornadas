import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { fetchJornada, init, insertJornada } from './Dbase';

// Função para formatar a hora no formato HH:mm
const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function App() {
  const [jornada, setJornada] = useState([]);
  const [entrada, setEntrada] = useState(null);
  const [almocoSaida, setAlmocoSaida] = useState(null);
  const [almocoRetorno, setAlmocoRetorno] = useState(null);
  const [saida, setSaida] = useState(null);

  useEffect(() => {
    init()
      .then(() => console.log('Banco de dados inicializado'))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    fetchJornada()
      .then(data => setJornada(data))
      .catch(err => console.error(err));
  }, []);

  const handleSaveJornada = () => {
    if (!entrada || !almocoSaida || !almocoRetorno || !saida) {
      Alert.alert('Erro', 'Todos os horários devem ser preenchidos.');
      return;
    }

    insertJornada(entrada, almocoSaida, almocoRetorno, saida)
      .then(result => {
        setJornada([...jornada, { entrada, almocoSaida, almocoRetorno, saida }]);
        Alert.alert('Sucesso', 'Jornada registrada com sucesso!');
      })
      .catch(err => console.error(err));
  };

  const calcularHoras = () => {
  if (!entrada || !almocoSaida || !almocoRetorno || !saida) return;

  // Converter os horários em formato HH:mm para objetos Date
  const entradaTime = new Date(`1970-01-01T${entrada}:00`);
  const almocoSaidaTime = new Date(`1970-01-01T${almocoSaida}:00`);
  const almocoRetornoTime = new Date(`1970-01-01T${almocoRetorno}:00`);
  const saidaTime = new Date(`1970-01-01T${saida}:00`);

  // Calcular o total de horas trabalhadas (subtração do horário de entrada e saída, descontando o intervalo de almoço)
  const jornadaTotal = (saidaTime - entradaTime) - (almocoRetornoTime - almocoSaidaTime);

  // Convertendo de milissegundos para minutos
  const jornadaEmMinutos = jornadaTotal / 60000;

  // Calcular o valor total de horas e minutos
  const horas = Math.floor(jornadaEmMinutos / 60);  // Horas inteiras
  const minutos = jornadaEmMinutos % 60;           // Restante de minutos

  // Jornada padrão de 8 horas, convertida para minutos
  const jornadaPadrao = 8 * 60;  // 8 horas = 480 minutos

  // Exibir jornada total no formato "HH:mm"
  const jornadaFormatada = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;

  // Comparar a jornada total com a jornada padrão
  if (jornadaEmMinutos > jornadaPadrao) {
    return (
      <Card style={styles.aviso}>
        <Text style={styles.paragraph}>Você trabalhou {jornadaFormatada} ({jornadaEmMinutos - jornadaPadrao} minutos extras)!</Text>
      </Card>
    );
  } else if (jornadaEmMinutos < jornadaPadrao) {
    const diferencaMinutos = jornadaPadrao - jornadaEmMinutos;
    const horasDevidas = Math.floor(diferencaMinutos / 60);
    const minutosDevidos = diferencaMinutos % 60;
    return (
      <Card style={styles.aviso}>
        <Text style={styles.paragraph}>
          Você ficou devendo {String(horasDevidas).padStart(2, '0')}:{String(minutosDevidos).padStart(2, '0')} horas.
        </Text>
      </Card>
    );
  } else {
    return (
      <Card style={styles.aviso}>
        <Text style={styles.paragraph}>Sua jornada foi de {jornadaFormatada}.</Text>
      </Card>
    );
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image style={styles.logo} source={require('./assets/icon.png')} />
      <Text style={styles.header}>Controle de Jornada</Text>

      <TouchableOpacity onPress={() => setEntrada(formatTime(new Date()))} style={styles.button}>
        <Text style={styles.buttonText}>Registrar Entrada</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setAlmocoSaida(formatTime(new Date()))} style={styles.button}>
        <Text style={styles.buttonText}>Registrar Saída Almoço</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setAlmocoRetorno(formatTime(new Date()))} style={styles.button}>
        <Text style={styles.buttonText}>Registrar Volta do Almoço</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setSaida(formatTime(new Date()))} style={styles.button}>
        <Text style={styles.buttonText}>Registrar Saída</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSaveJornada} style={styles.button}>
        <Text style={styles.buttonText}>Salvar Jornada</Text>
      </TouchableOpacity>

      {calcularHoras()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',   // Organiza os itens de forma vertical
    justifyContent: 'flex-start',  // Garante que o conteúdo fique na parte superior
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  aviso: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  paragraph: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  logo: {
    height: 128,
    width: 128,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,  // Adiciona um pouco de espaçamento entre os botões
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});