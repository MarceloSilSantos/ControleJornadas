import React, { useEffect, useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import { Card } from 'react-native-paper';
import { fetchJornada, init, insertJornada } from './db';

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

    const entradaTime = new Date(`1970-01-01T${entrada}`);
    const almocoSaidaTime = new Date(`1970-01-01T${almocoSaida}`);
    const almocoRetornoTime = new Date(`1970-01-01T${almocoRetorno}`);
    const saidaTime = new Date(`1970-01-01T${saida}`);

    const jornadaTotal = (saidaTime - entradaTime) - (almocoRetornoTime - almocoSaidaTime);
    const jornadaEmHoras = jornadaTotal / 1000 / 3600; // em horas
    const jornadaPadrao = 8; // jornada padrão de 8 horas

    if (jornadaEmHoras > jornadaPadrao) {
      return (
        <Card>
          <Text>Você trabalhou {jornadaEmHoras - jornadaPadrao} horas extras!</Text>
        </Card>
      );
    } else if (jornadaEmHoras < jornadaPadrao) {
      return (
        <Card>
          <Text>Você ficou devendo {jornadaPadrao - jornadaEmHoras} horas.</Text>
        </Card>
      );
    } else {
      return (
        <Card>
          <Text>Sua jornada foi de {jornadaEmHoras} horas.</Text>
        </Card>
      );
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Controle de Jornada</Text>
      <Button title="Registrar Entrada" onPress={() => setEntrada(formatTime(new Date()))} />
      <Button title="Registrar Saída para Almoço" onPress={() => setAlmocoSaida(formatTime(new Date()))} />
      <Button title="Registrar Retorno do Almoço" onPress={() => setAlmocoRetorno(formatTime(new Date()))} />
      <Button title="Registrar Saída" onPress={() => setSaida(formatTime(new Date()))} />

      <Button title="Salvar Jornada" onPress={handleSaveJornada} />

      {calcularHoras()}
    </View>
  );
}
