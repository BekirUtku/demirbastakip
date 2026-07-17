import { useEffect, useState } from 'react';
import api from '../services/api';

export default function EmailSignatures() {

  const [personnel, setPersonnel] = useState<any[]>([]);
  const [selectedPersonnel, setSelectedPersonnel] = useState<number | undefined>();

  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    loadPersonnel();
  }, []);


  const loadPersonnel = async () => {
    try {

      const response = await api.get('/Personnel');

      setPersonnel(response.data);

    } catch (error) {

      console.error(
        "Personel yükleme hatası:",
        error
      );

    }
  };


  const handlePreview = async () => {

    if (!selectedPersonnel)
      return;


    try {

      setLoading(true);


      const response = await api.post(
        '/email-signatures/preview',
        {
          personnelId: selectedPersonnel
        }
      );


      setPreview(response.data.html);


    } catch(error) {

      console.error(
        "İmza önizleme hatası:",
        error
      );


    } finally {

      setLoading(false);

    }

  };


  return (
    <div className="container mt-4">


      <h2>
        ✍️ E-Posta İmza Oluşturma
      </h2>


      <div className="card p-4 mt-3">


        <label className="form-label">
          PERSONEL SEÇ
        </label>


        <select
          className="form-select"
          value={selectedPersonnel ?? ''}
          onChange={(e)=>
            setSelectedPersonnel(
              Number(e.target.value)
            )
          }
        >

          <option value="">
            Personel seçiniz
          </option>


          {
            personnel.map(p => (

              <option
                key={p.id}
                value={p.id}
              >
                {p.firstName} {p.lastName}
              </option>

            ))
          }


        </select>



        <button
          className="btn btn-primary mt-3"
          disabled={!selectedPersonnel || loading}
          onClick={handlePreview}
        >

          {
            loading
            ?
            "Oluşturuluyor..."
            :
            "ÖNİZLEME"
          }

        </button>


      </div>



      <div className="card mt-4 p-4">


        <h5>
          Önizleme
        </h5>


        <hr />


        {
          preview
          ?
          <div
            dangerouslySetInnerHTML={{
              __html: preview
            }}
          />

          :

          <p>
            Henüz imza oluşturulmadı.
          </p>
        }


      </div>


    </div>
  );
}