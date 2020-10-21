import React, { Fragment, useEffect, useState } from "react";


const Client_Info = () => {
  const [client_id, setDescription] = useState("")
  const [info, setInfo] = useState([]);

  //delete todo function
  const getInfo = async (e) => {
    if(e) { e.preventDefault()}
    try {
      if (client_id.trim().length === 0) {
        return
      }
      if (parseInt(client_id)) {
        const response = await fetch(`http://localhost:8000/information/id/?client_id=${client_id}`);
      const jsonData = await response.json();
      console.log(jsonData)
      setInfo(jsonData);  
      } else {
        const response = await fetch(`http://localhost:8000/information/name/?client_id=${client_id}`);
      const jsonData = await response.json();
      console.log(jsonData)
      setInfo(jsonData);
      }
      
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getInfo();
  }, []);

  console.log(info);

  return (
    <Fragment>
       {/* Form */}
    <h1 className="text-center mt-5">Sask Fund Application</h1>
      <form className="d-flex mt-5" onSubmit={getInfo}>
        <input
          type="text"
          className="form-control"
          placeholder="Enter Client ID OR Client Name"
          value={client_id}
          onChange={e => setDescription(e.target.value)} // onChange is required to change the value,i.e it allows to add in the text field..
        />
        
        <button className="btn btn-success">Check Client Information</button>
      </form>
      <table className="table mt-5 text-center">
        <thead>
          <tr>
            <th>Client Name</th>
            <th>Client Id</th>
            <th>Gender</th>
            <th>Age</th>
            <th>City</th>
            <th>Golden Membership</th>
          </tr>
        </thead>
        <tbody>
          {/*<tr>
            <td>John</td>
            <td>Doe</td>
            <td>john@example.com</td>
          </tr> */}
          {info.map(info => (
            <tr key={info.client_id}>
              <td>{info.name}</td>
              <td>
               {info.client_id}
              </td>
              <td>
                {info.gender}
              </td>
              <td>
                {info.age}
              </td>
              <td>
                {info.city}
              </td>
              <td>
                {info.gold_membership === 0 ? 'NO': 'YES'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Fragment>
  );
};

export default Client_Info;