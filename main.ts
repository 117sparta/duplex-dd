import * as grpc from '@grpc/grpc-js';
import { ConnectClient } from './proto-api/connect_grpc_pb';
import { Command, CommandResponse } from './proto-api/connect_pb';

const backendAddr = 'localhost:50051';

function constructClient<T>(Client: {
  new (
    address: string,
    credentials: grpc.ChannelCredentials,
    options?: object
  ): T;
}): T {
  return new Client(backendAddr, grpc.credentials.createInsecure());
}

const connectClient = constructClient<ConnectClient>(ConnectClient);


function connectServer() {
  let hasConnect = false;

  const call = connectClient.connect();
  const commandV2 = new Command();
  commandV2.setId('e40-5c-45d4-03-7eb50');
  commandV2.setType(0);
  commandV2.setPayload(new Uint8Array([72, 101, 108, 108, 111]));

  const pingCall = () => {
    call.write(commandV2);
  };

  const intervalPing = () =>
    setInterval(() => {
      pingCall();
    }, 10000);

  setTimeout(() => {
    if (!hasConnect) intervalPing();
    hasConnect = true;
  }, 50000);

  call.on('data', (data: CommandResponse) => {
    const dataObj: CommandResponse.AsObject = data.toObject();
    if (!hasConnect) intervalPing();
    hasConnect = true;
    console.log(dataObj);
  });
  call.on('end', (e: unknown) => {
    return e;
    // console.log('end', e);
    // The server has finished sending
  });
  call.on('error', (e: Error) => {
    call.end();
    return e;
    // console.log('e', e);
    // An error has occurred and the stream has been closed.
  });
  call.on('status', (status: unknown) => {
    return status;
    // console.log('status', status);
    // process status
  });
}

connectServer();
