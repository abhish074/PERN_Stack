import React, { Fragment, useEffect, useState } from "react";


const ListInfo = () => {
    const [client_id, setDescription] = useState("");//data getting from the input,, ("") default is a empty string..
    const [info1, setInfo] = useState([]);
    // const [idclient] = useState([])

  const getclientInformation = async (e) => {
    if(e) { e.preventDefault()}
    // e.preventDefault()
    if (client_id && client_id.trim().length > 0) {
        try {
            
            const response = await fetch(`http://localhost:8000/?client_id=${client_id}`);//await,since it takes little time to parse the data
            const jsonData = await response.json();//response.json since we need to parse the json response..
            if (Array.isArray(jsonData)) {
              setInfo(jsonData)
            } else {
              setInfo([jsonData])
            }
            console.log(info1)
            //setInfo(jsonData);
          } catch (err) {
            console.error(err.message);
          }
    } 
    
    else {
        setInfo([])
    }
  };
//useEffect will make a fetch reuquest to restful apis every time 
//the current component is rendered...
  useEffect(() => {
    
    // if (information && information.trim().length > 0) {
        getclientInformation();
    // }  
  }, []);//  there are lot requests, hence using [] we make only one request


  return (
    <Fragment>
       
       {/* Form */}
    <h1 className="text-center mt-5">Sask Fund Application</h1>
      <form className="d-flex mt-5" onSubmit={getclientInformation}>
        <input
          type="number"
          className="form-control"
          placeholder="Enter Client ID"
          value={client_id}
          onChange={e => setDescription(e.target.value)} // onChange is required to change the value,i.e it allows to add in the text field..
        />
        
        <button className="btn btn-success">Check Eligibility</button>
      </form>
        {/* form end */}
      <table className="table mt-5 text-center">
        <thead>
          <tr>
             <th>Name</th>
             <th>Client ID</th>
             <th>Eligibility</th>
             <th>Maximum Monthly Payments</th>
            {/* <th>Edit</th>
            <th>Delete</th> */}
          </tr>
        </thead>
        <tbody>
          {/* <tr>
            <td>John</td>
            <td>Doe</td>
            <td>john@example.com</td>
          </tr> */}
          {info1.length > 0 ? info1.map(info => (
              <tr key={info.Client_Id}>
                <td>{info.Name}</td>
                <td>{info.Client_Id}</td>
                <td>{info.Eligibility_Status}</td>
                <td>{info.Maximum_Monthly_Payments}</td>
              </tr>
            
          )): <tr></tr>}
        </tbody>
      </table>
      
    </Fragment>
  );
};

export default ListInfo;