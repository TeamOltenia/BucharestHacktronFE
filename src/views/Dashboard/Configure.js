import React, { useState } from 'react';
import {
  Flex,
  Code,
  Select,
  useToast,
  Text,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Button
} from '@chakra-ui/react';

function Configure() {
  const [code, setCode] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    cc_num: '',
    merchant: '',
    category: '',
    amt: '',
    first: '',
    last: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    unix_time: ''
  });

  const toast = useToast();

  const handleChange = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://jzrv5cep7iuqguybomf6n2rhj40iyjnm.lambda-url.eu-north-1.on.aws/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', "Accept": "*/*", "Connection": "keep-alive"},
          body: JSON.stringify({ payment_provider: paymentProvider, payment_details: paymentDetails }),
      });
      console.log(response)
      // Check if response was ok and handle the data
      if (response.ok) {
          const data = await response.json(); // Assuming the server responds with JSON
          const description = data.is_fraud
              ? 'Payment details was not submitted successfully. Transaction is considered fraudulent!'
              : 'Payment details was submitted successfully. Transaction is not fraudulent!';

          toast({
              title: "Success",
              description: description,
              status: "success",
              duration: 9000,
              isClosable: true,
              position: "top"
          });

          // Reset the form only after successful submission
          setPaymentDetails({
              cc_num: '',
              merchant: '',
              category: '',
              amt: '',
              first: '',
              last: '',
              street: '',
              city: '',
              state: '',
              zip: '',
              unix_time: ''
          });
          setPaymentProvider('');
      } else {
          throw new Error('Server responded with a status: ' + response.status);
      }
  } catch (error) {
      console.error(error);
      toast({
          title: "Error",
          description: "Failed to submit payment details: " + error.toString(),
          status: "error",
          duration: 9000,
          isClosable: true,
          position: "top"
      });
  }
  };

  return (
    <Flex flexDirection="column" marginLeft="30px">
      <Text fontSize="2xl" textColor="white" marginTop="100px" textAlign="center">Configure your payments providers!</Text>
      <Select placeholder='Select option' textColor="dimgray" marginTop="20px" onChange={(e) => setPaymentProvider(e.target.value)} width={"30%"}>
        <option value='stripe'>Stripe</option>
        <option value='paypal'>PayPal</option>
        <option value='klarna'>Klarna</option>
        <option value='add_yours'>Add a payment provider</option>
      </Select>
      <Button size="md" width="100px" marginTop="50px" onClick={() => setCode(true)}>Configure</Button>
      {code && (
        <Code marginTop="40px">
          {`curl --location --request POST 'https://jzrv5cep7iuqguybomf6n2rhj40iyjnm.lambda-url.eu-north-1.on.aws/' \\
          --header 'Content-Type: application/json' \\
          --data-raw '{
            "payment_provider": "${paymentProvider}",
            "payment_details": {
              <transaction_body>
            }
          }'`}
        </Code>
      )}
      <Flex>
        <Text fontSize="3xl" style={{ color: "white", textAlign: "center", margin: "50px 0 0 700px" }}>OR</Text>
      </Flex>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          {Object.keys(paymentDetails).map((key) => (
            <FormControl isRequired key={key}>
              <FormLabel color="white">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</FormLabel>
              <Input
                name={key}
                type={key === "amt" || key.includes("num") || key === "zip" || key === "unix_time" ? "number" : "text"}
                value={paymentDetails[key]}
                onChange={handleChange}
                textColor="white"
                width="45%" // Smaller width
              />
            </FormControl>
          ))}
          <Button type="submit" colorScheme="blue" width="100px">Submit</Button>
        </VStack>
      </form>
    </Flex>
  );
}

export default Configure;
